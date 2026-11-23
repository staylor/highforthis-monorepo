# High For This Monorepo

A full-stack monorepo for [highforthis.com](https://highforthis.com) — a music-focused site covering shows, artists, venues, videos, podcasts, and editorial content.

## Workspaces

| Workspace                          | Description                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| [`graphql`](./graphql)             | GraphQL API server (Apollo Server, remix/data-table, PostgreSQL) |
| [`web`](./web)                     | Public site and admin (Remix 3)                                  |
| [`shared`](./shared)               | Logging and OpenTelemetry for GraphQL and web                    |
| [`e2e`](./e2e)                     | Playwright end-to-end tests of the admin                         |
| [`observability`](./observability) | OpenObserve backend and GUI deployment                           |
| [`apple`](./apple)                 | iOS, iPadOS, macOS and tvOS app (SwiftUI, Apollo iOS)            |

## Requirements

- macOS with [Homebrew](https://brew.sh)
- Node.js 24 (`nvm use` reads `.nvmrc`)
- pnpm 10 (`corepack enable` provides the version in `package.json`)

## Setup

```bash
pnpm bootstrap   # install Postgres and packages, create graphql/.env, load the seed data
pnpm dev         # GraphQL at http://localhost:8081/graphql, the site at http://localhost:3000, admin at /admin
```

`pnpm bootstrap` is safe to run again: it only does what's missing and never replaces data. `pnpm db:reset` rebuilds the database from the seed, and `pnpm db:refresh` loads a production snapshot. The app runs without any API keys; add the ones a feature needs to `graphql/.env` (see [`graphql/README.md`](./graphql/README.md#environment-variables)).

Both Node services emit structured JSON logs. When an `OTEL_EXPORTER_OTLP_ENDPOINT` is configured, they also export correlated logs, traces, HTTP/GraphQL spans, and runtime metrics through OTLP. See [`observability/README.md`](./observability/README.md) for OpenObserve and Railway setup.

## Scripts

| Script                          | Description                                                |
| ------------------------------- | ---------------------------------------------------------- |
| `pnpm bootstrap`                | Set up a fresh clone (Postgres, packages, .env, database)  |
| `pnpm dev`                      | Start GraphQL and the web app in development               |
| `pnpm graphql:dev`              | Start GraphQL server in development (watch mode)           |
| `pnpm web:dev`                  | Start web app in development                               |
| `pnpm observability:dev`        | Start OpenObserve with Docker                              |
| `pnpm observability:dev:podman` | Start OpenObserve with Podman                              |
| `pnpm build`                    | Build all workspaces for production                        |
| `pnpm codegen`                  | Run GraphQL Codegen (TypeScript types, schema, Apollo iOS) |
| `pnpm codegen:ios`              | Regenerate the app's Swift API from the committed schema   |
| `pnpm db:reset`                 | Rebuild the local database from the seed data              |
| `pnpm db:refresh`               | Replace the local database with the latest production data |
| `pnpm lint`                     | Lint with oxlint and ESLint (GraphQL), check formatting    |
| `pnpm lint-fix`                 | Lint, auto-fix and format                                  |
| `pnpm knip`                     | Find unused files, exports, and dependencies               |
| `pnpm test:web`                 | Run web workspace tests                                    |
| `pnpm test:browser`             | Run web's in-browser tests, such as the post editor's      |
| `pnpm test:e2e`                 | Run the end-to-end tests of the admin (see below)          |
| `pnpm e2e:admin`                | Create the local test admin, or reset its password         |
| `pnpm typecheck`                | Type-check all workspaces                                  |

## End-to-end tests

[`e2e`](./e2e) is a [Playwright](https://playwright.dev) suite that signs in to the admin and drives it, as production does. It finds things by URL, role, label and visible text. With Postgres running and `graphql/.env` in place (`pnpm bootstrap` does both):

```bash
pnpm test:e2e
```

That builds `shared`, runs `pnpm e2e:admin`, installs Playwright's Chromium if it's missing, and starts GraphQL on port 3202 and the public site, with the admin, on 3200, so it can run alongside `pnpm dev`. The tests sign in once, keep the session in `e2e/.auth/`, and run in parallel against http://localhost:3200.

- **Test admin:** `pnpm e2e:admin` copies `e2e/.env.example` to `e2e/.env` (gitignored), fills in a random password, and creates `e2e-admin@highforthis.test` in the local database or resets its password. It only accepts `.test` addresses and databases on this machine.
- **Data:** the tests use the database in `graphql/.env`, or `E2E_DATABASE_URL` from `e2e/.env`. They create what they need through GraphQL, name it with an `[e2e]` prefix, and remove it afterwards; each run also removes anything an interrupted run left behind. The media picker test needs more than 50 images, which the seed has.
- **Debugging:** `pnpm --filter @highforthis/e2e test:ui` opens Playwright's UI mode. A failed test keeps a screenshot and a trace in `e2e/test-results/`.
- **Running servers:** outside CI, servers already listening on those ports are reused, and web's CSS isn't rebuilt. Stop them to test changes.
- **CI:** the "End-to-end tests" job in [`ci.yml`](./.github/workflows/ci.yml) runs the suite on every pull request, against a Postgres 18 service loaded from the seed, with retries. When it fails, the report, screenshots and traces are uploaded as the `playwright-report` artifact.

## GraphQL Codegen

The root `codegen.ts` builds the schema from the type definitions in [`graphql/src/schema`](./graphql/src/schema), the same ones the server uses, so it doesn't need the server running. It generates:

- `graphql/schema.graphql` — SDL schema file
- `graphql/types/graphql.ts` — TypeScript types for the server
- `web/app/types/schema.ts` and `web/app/types/graphql.ts` — TypeScript schema types, and the site's and admin's operations
- `apple/HighForThisAPI/` — Swift types for the app (via Apollo iOS, from `graphql/schema.graphql`)

```bash
pnpm codegen
```

CI fails when the schema or an operation changed without regenerating the TypeScript types. `pnpm codegen:ios` regenerates only `apple/HighForThisAPI/`, from the committed schema. See [`apple/README.md`](./apple/README.md).

## Observability

The shared [`@highforthis/shared`](./shared) workspace initializes OpenTelemetry before either application loads, allowing automatic HTTP, GraphQL, PostgreSQL, and runtime instrumentation plus structured Pino logging. Both apps are ES modules, which the HTTP instrumentation can't patch on import, so `startObservability()` requires `node:http` itself to trace incoming requests. Web names each request's span after the route that matched it, such as `GET /shows/:id` ([`web/app/lib/tracing.ts`](./web/app/lib/tracing.ts)), so its traces group by route and hold the GraphQL calls each page made. Requests receive an `x-request-id`; logs produced inside a trace also contain OpenTelemetry trace and span IDs.

OpenObserve runs as a separate Railway service using the pinned image and configuration in [`observability`](./observability). A persistent Railway volume mounted at `/data` is required.

## Passkey authentication

Admin users can register passkeys at `/admin/passkeys` and sign in with Face ID, Touch ID, a security key, or a nearby device. Registration is restricted to an existing authenticated admin session. The canonical production WebAuthn configuration is:

```text
WEBAUTHN_RP_ID=highforthis.com
WEBAUTHN_ORIGIN=https://highforthis.com
WEBAUTHN_RP_NAME=High For This Admin
PASSWORD_LOGIN_ENABLED=true
```

Set the WebAuthn variables on `graphql` and `PASSWORD_LOGIN_ENABLED` on `graphql` and `web`. Keep password login enabled until at least two passkeys have been registered and tested, then set `PASSWORD_LOGIN_ENABLED=false` on both. For local registration, override the relying party values with `WEBAUTHN_RP_ID=localhost` and `WEBAUTHN_ORIGIN=http://localhost:3000`.

The GraphQL Railway pre-deploy command applies the database migrations (`pnpm db:migrate`) before the new application starts.

## Production

Each workspace has `build` and `start` scripts. Build bundles the app, start runs it with Node. Environment variables are loaded from `.env.production` via `--env-file-if-exists` (or set directly in the hosting platform).

```bash
# Build all workspaces
pnpm build

# Start each workspace
pnpm --filter @highforthis/graphql start
pnpm --filter @highforthis/web start
```

## License

Private
