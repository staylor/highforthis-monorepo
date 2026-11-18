# @highforthis/web

The public High For This site, built with [Remix 3](https://github.com/remix-run/remix) and Tailwind CSS. The admin is a separate React Router app in [`admin`](../admin); this server forwards `/admin`, `/login`, `/modals`, `/upload` and `/auth/passkeys` to it, so both share one domain.

Remix 3 has no bundler. The server renders every page, the browser runtime turns same-origin links into client navigations, and the few interactive parts (dark mode, the mobile menu, video thumbnails, the sphere setlists, live refresh) hydrate as client entries. The asset server compiles browser modules on request and serves them unbundled through an import map, fingerprinted in production.

## Stack

- **[Remix 3](https://github.com/remix-run/remix)**: routing, server rendering, client entries and the asset server
- **[Tailwind CSS v4](https://tailwindcss.com/)**, built by the Tailwind CLI into `app/styles/public/`
- **[Apollo Client](https://www.apollographql.com/docs/react/)** core, on the server only
- **[i18next](https://www.i18next.com/)**, on the server; client entries get translated strings as props
- **OpenObserve browser RUM**, which records page views for the admin dashboard

## Development

`pnpm dev` from the monorepo root starts GraphQL, web and admin. The site is at http://localhost:3000.

```bash
pnpm web:dev   # just this app
```

`pnpm dev` restarts the server on changes and rebuilds the CSS. `pnpm hmr` (in this folder) also hot-reloads server and browser modules.

### Environment Variables

| Variable | Description |
| --- | --- |
| `SERVER_PORT` | Web server port (default: `3000`; Railway's `PORT` wins) |
| `GQL_HOST` | GraphQL server URL (default: `http://localhost:8081`) |
| `ADMIN_HOST` | Admin app URL that admin paths are forwarded to (default: `http://localhost:3001`) |
| `TOKEN_KEY` | Admin session cookie name (default: `__session`); must match `admin` |
| `TOKEN_SECRET` | Admin session cookie secret; must match `admin` (development has a default) |
| `OPENOBSERVE_RUM_APPLICATION_ID` | OpenObserve RUM application ID; setting any required RUM variable enables browser monitoring |
| `OPENOBSERVE_RUM_CLIENT_TOKEN` | Browser ingestion token from OpenObserve's RUM setup (this token is intentionally sent to browsers) |
| `OPENOBSERVE_RUM_SITE` | OpenObserve host or URL, such as `https://openobserve.example.com` |
| `OPENOBSERVE_RUM_ORGANIZATION_IDENTIFIER` | OpenObserve organization (default: `default`) |
| `OPENOBSERVE_RUM_SESSION_SAMPLE_RATE` | Percentage of sessions monitored (default: `100`) |
| `OPENOBSERVE_RUM_REPLAY_SAMPLE_RATE` | Percentage of sessions recorded for replay; use `0` to disable replay (default: `20`) |
| `OPENOBSERVE_RUM_TRACE_SAMPLE_RATE` | Percentage of same-origin requests correlated with backend traces (default: `100`) |
| `OPENOBSERVE_RUM_SERVICE` | RUM service name (default: `web`) |
| `OPENOBSERVE_RUM_ENVIRONMENT` | Deployment environment (defaults to the Railway environment or `NODE_ENV`) |
| `OPENOBSERVE_RUM_VERSION` | Deployed version (defaults to the Railway Git SHA) |

Public pages only read the admin's session cookie to know someone is signed in, which turns on live refresh. The admin app signs it with React Router's cookie format, which `app/lib/adminSession.ts` verifies.

RUM tracks views manually: Remix navigates with the browser's Navigation API, which the RUM SDK doesn't watch, so `app/actions/public/rum.ts` starts a view on load and after each navigation.

## Production

```bash
pnpm build   # builds shared and the CSS; there is no app build step
pnpm start   # NODE_ENV=production; compiles, minifies and fingerprints modules on request
```

Assets are served from `/assets` by this server with immutable caching. On Railway, the CDN on the site's domain keeps them at the edge.

## Scripts

| Script           | Description                                   |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Start in development                          |
| `pnpm hmr`       | Start in development with hot module reload   |
| `pnpm build`     | Build shared and the CSS                      |
| `pnpm start`     | Start the production server                   |
| `pnpm css`       | Build the CSS once                            |
| `pnpm test`      | Run tests with Remix's test runner            |
| `pnpm typecheck` | Type-check                                    |

## Project Structure

```
app/
├── routes.ts          # Every route's URL pattern
├── router.ts          # Middleware and controllers
├── actions/           # Controllers and pages, by route
│   └── public/        # Browser entry, RUM and other client modules
├── ui/                # Components (ui/public/ holds client entries)
├── lib/               # GraphQL client, i18n, RUM config, admin session
├── middleware/        # Proxies, GraphQL client, translations
├── styles/            # Tailwind input (public/ is the built CSS)
└── types/             # Generated GraphQL operation types
server.ts              # Node HTTP server and logging
public/                # Static files and translations
```

Use the Remix skill in [`.agents/skills/remix/SKILL.md`](.agents/skills/remix/SKILL.md) when building features; it explains how to find the framework's guides and API docs in `node_modules/remix`.
