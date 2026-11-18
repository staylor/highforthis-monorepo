# @highforthis/web

The public High For This site, built with React Router v7 (SSR), Vite, and Tailwind CSS. The admin is a separate app in [`admin`](../admin), which this server forwards `/admin`, `/login`, `/modals`, `/upload` and `/auth/passkeys` to.

## Stack

- **[React Router v7](https://reactrouter.com/)** — Full-stack framework (SSR + client)
- **[Vite](https://vitejs.dev/)** — Build tool and dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS
- **[Apollo Client](https://www.apollographql.com/docs/react/)** — GraphQL client
- **[i18next](https://www.i18next.com/)** — Internationalization
- **[Vitest](https://vitest.dev/)** — Unit testing

## Setup

```bash
# From the monorepo root
pnpm install

# Ensure the GraphQL server is running
pnpm graphql:dev
```

### Environment Variables

| Variable | Description |
| --- | --- |
| `SERVER_PORT` | Web server port (default: `3000`) |
| `GQL_HOST` | GraphQL server URL (default: `http://localhost:8081`) |
| `ADMIN_HOST` | Admin app URL that admin paths are forwarded to (default: `http://localhost:3001`) |
| `TOKEN_KEY` | Session cookie name; must match `admin` |
| `TOKEN_SECRET` | Signs the session cookie; must match `admin` (development has a default) |
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

## Development

```bash
pnpm dev
# Server starts at http://localhost:3000
```

The server proxies `/graphql` and `/uploads` to the GraphQL server, and admin paths to the admin app. `pnpm dev` from the monorepo root starts all three.

## Production

```bash
# Build
pnpm build

# Upload static assets to CDN
pnpm prod:upload

# Start
pnpm start
```

`build` cleans the build directory and builds with React Router / Vite. `prod:upload` syncs client assets to Google Cloud Storage. `start` runs the production server with Node.

## Scripts

| Script             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `pnpm dev`         | Start in development                             |
| `pnpm build`       | Clean and build for production                   |
| `pnpm prod:upload` | Upload client assets to Google Cloud Storage     |
| `pnpm start`       | Start the production server                      |
| `pnpm test`        | Run tests with Vitest                            |
| `pnpm test:watch`  | Run tests in watch mode                          |
| `pnpm test:update` | Update test snapshots                            |
| `pnpm typecheck`   | Generate route types and type-check              |

## Project Structure

```
src/
├── entry.client.tsx   # Client entry point
├── entry.server.tsx   # Server entry point (SSR)
├── root.tsx           # Root layout
├── routes.ts          # Route definitions
├── routes/
│   ├── home/          # Homepage
│   ├── artist.tsx     # Artist pages
│   ├── venue.tsx      # Venue pages
│   ├── shows/         # Show listings
│   ├── videos/        # Video pages
│   ├── podcast/       # Podcast pages
│   ├── post/          # Editorial posts
│   └── ...
├── components/        # UI components (ones admin also uses are in shared/src/web)
├── hooks/             # Custom React hooks
├── styles/            # Global styles
└── utils/             # Utilities
server.js              # Express server (SSR + proxy)
```
