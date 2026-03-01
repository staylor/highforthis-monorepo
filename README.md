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

| Script | Description |
| --- | --- |
| `pnpm graphql:dev` | Start GraphQL server in development (watch mode) |
| `pnpm graphql:prod` | Build and start GraphQL server for production |
| `pnpm web:dev` | Start web app in development |
| `pnpm web:prod` | Build, upload assets, and start web app for production |
| `pnpm prod` | Build and start all workspaces for production |
| `pnpm codegen` | Run GraphQL Codegen (TypeScript types, schema, Apollo iOS) |
| `pnpm lint` | Lint all workspaces with ESLint |
| `pnpm lint-fix` | Lint and auto-fix |
| `pnpm knip` | Find unused files, exports, and dependencies |
| `pnpm test:web` | Run web workspace tests |
| `pnpm typecheck:graphql` | Type-check the GraphQL workspace |
| `pnpm typecheck:web` | Type-check the web workspace |

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

Both `graphql` and `web` use [PM2](https://pm2.keymetrics.io/) for process management in production. Each workspace has a `pm2.config.cjs` that loads environment variables from `.env.production`.

## License

Private
