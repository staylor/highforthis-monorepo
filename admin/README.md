# @highforthis/admin

The High For This admin: the dashboard, the post editor, and the forms for artists, venues, shows, media, videos, podcasts, users, passkeys and settings. It also serves the login page and the media/video pickers the editor opens. Built with React Router v7 (SSR), Vite, Tailwind CSS and Lexical, like the public site was before the split.

## How it's served

The admin is its own app, but it shares the public site's domain. The `web` server forwards these paths here:

- `/admin`: the admin itself
- `/login`: password and passkey sign-in
- `/modals`: the media and video pickers
- `/upload`: media uploads (the token from the session cookie is added here)
- `/auth/passkeys`: passkey sign-in

So URLs, the session cookie, passkeys, and the public site's live refresh while you're signed in work as they did before the split.

Vite's `base` is `/admin/`, so this app's scripts, styles and public files (translations, editor icons, favicon) live under `/admin/` and never collide with the public site's. Every route is in the first page's manifest (`routeDiscovery: { mode: 'initial' }`), so the browser never asks for `/__manifest`, which the public site answers. Links to public pages are plain links that open with a full page load.

Code both apps use lives in `shared/src` and is imported as `@highforthis/shared/...`: UI components, data helpers, the session, the GraphQL schema types and the Apollo client. Code only the admin uses stays here. Codegen writes this app's operation types to `src/types/graphql.ts`, which also re-exports the schema types from `shared`, so admin code imports every GraphQL type from `#/types/graphql`.

## Development

`pnpm dev` from the monorepo root starts GraphQL, web and admin. Open the admin through the public site at http://localhost:3000/admin.

```bash
pnpm admin:dev   # just this app, on http://localhost:3001
```

### Environment Variables

| Variable                 | Description                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `ADMIN_PORT`             | Server port (default: `3001`; Railway's `PORT` wins)                                |
| `ADMIN_HMR_PORT`         | Vite hot-reload port in development (default: `24679`, so it doesn't clash with web) |
| `GQL_HOST`               | GraphQL server URL (default: `http://localhost:8081`)                               |
| `TOKEN_KEY`              | Session cookie name; must match `web`                                               |
| `TOKEN_SECRET`           | Signs the session cookie; must match `web` (development has a default)              |
| `PASSWORD_LOGIN_ENABLED` | Set to `false` to allow passkey sign-in only                                        |

## Production

```bash
pnpm build   # React Router / Vite build into build/
pnpm start   # serves the app and its files under /admin/
```

On Railway this is the `highforthis-admin` service. Railway no longer lets new services read a `railway.toml`, so its settings live on the service:

| Setting         | Value                                   |
| --------------- | --------------------------------------- |
| Build command   | `pnpm --filter @highforthis/admin build` |
| Start command   | `cd admin && exec node server.js`       |
| Healthcheck     | `/health`                               |
| Restart policy  | On failure, up to 3 times               |
| Watch paths     | `shared/**`, `admin/**`                 |
| Public domain   | None; `web` reaches it privately        |

Its variables reference `highforthis-web`'s (for example `TOKEN_SECRET=${{highforthis-web.TOKEN_SECRET}}`), so the session cookie settings always match, plus `NODE_ENV=production` and `PORT=3001`. `highforthis-web` has `ADMIN_HOST=http://${{highforthis-admin.RAILWAY_PRIVATE_DOMAIN}}:${{highforthis-admin.PORT}}`.

To send its telemetry to OpenObserve, set `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` on the service. Web's header is a sealed variable, which a reference can't read, so it has to be set on its own.

## Scripts

| Script           | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Start in development                |
| `pnpm build`     | Build for production                |
| `pnpm start`     | Start the production server         |
| `pnpm test`      | Run tests with Vitest               |
| `pnpm typecheck` | Generate route types and type-check |
