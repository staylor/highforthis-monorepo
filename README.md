# High For This Monorepo

A full-stack monorepo for [highforthis.com](https://highforthis.com) — a music-focused site covering shows, artists, venues, videos, podcasts, and editorial content.

## Workspaces

| Workspace | Description |
| --- | --- |
| [`graphql`](./graphql) | GraphQL API server (Apollo Server, Prisma, PostgreSQL) |
| [`web`](./web) | Web application (React Router v7, Vite, Tailwind CSS) |
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

## Scripts

| Script            | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `pnpm graphql:dev` | Start GraphQL server in development (watch mode)        |
| `pnpm web:dev`    | Start web app in development                             |
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
