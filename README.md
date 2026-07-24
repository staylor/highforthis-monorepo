# High For This Monorepo

A full-stack monorepo for [highforthis.com](https://highforthis.com) — a music-focused site covering shows, artists, venues, videos, podcasts, and editorial content.

## Workspaces

| Workspace | Description |
| --- | --- |
| [`graphql`](./graphql) | GraphQL API server (Apollo Server, Prisma, PostgreSQL) |
| [`web`](./web) | Web application (React Router v7, Vite, Tailwind CSS) |
| [`shared`](./shared) | Shared structured logging and OpenTelemetry utilities |
| [`observability`](./observability) | OpenObserve backend and GUI deployment |
| [`xcode`](./xcode) | iOS app (Swift, Apollo iOS) |

## Requirements

- Node.js >= 24
- pnpm 10.x
- PostgreSQL 17
- ffprobe (for audio metadata)

## Setup

```bash
# Install dependencies
pnpm install

# Start both GraphQL and Web in development
pnpm graphql:dev   # http://localhost:8080/graphql
pnpm web:dev       # http://localhost:3000
```

Both Node services emit structured JSON logs. When an `OTEL_EXPORTER_OTLP_ENDPOINT` is configured, they also export correlated logs, traces, HTTP/GraphQL spans, and runtime metrics through OTLP. See [`observability/README.md`](./observability/README.md) for OpenObserve and Railway setup.

## Scripts

| Script            | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `pnpm graphql:dev` | Start GraphQL server in development (watch mode)        |
| `pnpm web:dev`    | Start web app in development                             |
| `pnpm observability:dev` | Start OpenObserve with Docker                    |
| `pnpm observability:dev:podman` | Start OpenObserve with Podman             |
| `pnpm build`      | Build all workspaces for production                      |
| `pnpm codegen`    | Run GraphQL Codegen (TypeScript types, schema, Apollo iOS) |
| `pnpm lint`       | Lint all workspaces with ESLint                          |
| `pnpm lint-fix`   | Lint and auto-fix                                        |
| `pnpm knip`       | Find unused files, exports, and dependencies             |
| `pnpm test:web`   | Run web workspace tests                                  |
| `pnpm typecheck`  | Type-check all workspaces                                |

## GraphQL Codegen

The root `codegen.ts` generates:

- `graphql/schema.graphql` — SDL schema file
- `graphql/schema.json` — Introspection JSON
- `graphql/types/graphql.ts` — TypeScript types for the server
- `web/src/types/graphql.ts` — TypeScript types + operations for the client
- `web/apollo/fragmentMatcher.js` — Fragment matcher for Apollo Client
- `xcode/HighForThisAPI/` — Swift types for the iOS app (via Apollo iOS)

Requires the GraphQL server to be running locally:

```bash
pnpm graphql:dev
pnpm codegen
```

## Observability

The shared [`@highforthis/shared`](./shared) workspace initializes OpenTelemetry before either application loads, allowing automatic HTTP, Express, GraphQL, and runtime instrumentation plus structured Pino logging. Requests receive an `x-request-id`; logs produced inside a trace also contain OpenTelemetry trace and span IDs.

OpenObserve runs as a separate Railway service using the pinned image and configuration in [`observability`](./observability). A persistent Railway volume mounted at `/data` is required.

## Passkey authentication

Admin users can register passkeys at `/admin/passkeys` and sign in with Face ID, Touch ID, a security key, or a nearby device. Registration is restricted to an existing authenticated admin session. The canonical production WebAuthn configuration is:

```text
WEBAUTHN_RP_ID=highforthis.com
WEBAUTHN_ORIGIN=https://highforthis.com
WEBAUTHN_RP_NAME=High For This Admin
PASSWORD_LOGIN_ENABLED=true
```

Set the WebAuthn variables on `graphql` and `PASSWORD_LOGIN_ENABLED` on both Node services. Keep password login enabled until at least two passkeys have been registered and tested, then set `PASSWORD_LOGIN_ENABLED=false` on both services. For local registration, override the relying party values with `WEBAUTHN_RP_ID=localhost` and `WEBAUTHN_ORIGIN=http://localhost:3000`.

The GraphQL Railway pre-deploy command runs `prisma db push` so the passkey tables exist before the new application starts.

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
