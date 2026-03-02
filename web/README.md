# @highforthis/web

Web application for High For This, built with React Router v7 (SSR), Vite, and Tailwind CSS.

## Stack

- **[React Router v7](https://reactrouter.com/)** — Full-stack framework (SSR + client)
- **[Vite](https://vitejs.dev/)** — Build tool and dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS
- **[Apollo Client](https://www.apollographql.com/docs/react/)** — GraphQL client
- **[Lexical](https://lexical.dev/)** — Rich text editor (admin)
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
| `GQL_HOST` | GraphQL server URL (default: `http://localhost:8080`) |

## Development

```bash
pnpm dev
# Server starts at http://localhost:3000
```

The dev server proxies `/graphql` and `/upload` requests to the GraphQL server.

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
│   ├── admin/         # Admin dashboard
│   ├── login/         # Authentication
│   └── ...
├── components/        # Shared UI components
├── hooks/             # Custom React hooks
├── styles/            # Global styles
├── types/             # Generated GraphQL types
└── utils/             # Utilities
server.js              # Express server (SSR + proxy)
```
