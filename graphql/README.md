# @highforthis/graphql

GraphQL API server for High For This, built with Apollo Server, Remix's Fetch API server packages, and Prisma with PostgreSQL.

## Stack

- **[Apollo Server](https://www.apollographql.com/docs/apollo-server/)** — GraphQL server
- **[Remix](https://remix.run/)** — HTTP server: `remix/node-fetch-server` and `remix/router`, with Remix's CORS, compression and static middleware, and `remix/form-data-parser` for uploads
- **[Prisma](https://www.prisma.io/)** — ORM with PostgreSQL adapter (`@prisma/adapter-pg`)
- **JWT** — Authentication via `jsonwebtoken` and `bcryptjs`

## Setup

From the monorepo root, `pnpm bootstrap` sets everything up, and `pnpm dev` starts GraphQL with the web app. See the [root README](../README.md#setup).

Bootstrap installs PostgreSQL 18 from the `Brewfile`, creates `graphql/.env` from [`.env.example`](.env.example), and runs `pnpm db:setup`. That creates the database if it's missing, applies the Prisma schema, and loads `dump/highforthis-seed.dump` into an empty database. It's safe to run again; existing data is kept.

`DATABASE_URL` connects as your macOS user, which Homebrew's Postgres sets up as a superuser with no password. Loading the seed needs a superuser, because the restore disables foreign key triggers.

The schema is applied with `prisma db push`; there are no migration files. Railway's pre-deploy command runs the same push against production.

### Environment Variables

In development (`pnpm dev`), only `DATABASE_URL` is needed. Everything else is optional, and a feature that needs a missing value fails with a message naming it. Outside development, the server won't start without the required ones.

| Variable                          | Required in production | Description                                       |
| --------------------------------- | ---------------------- | ------------------------------------------------- |
| `DATABASE_URL`                    | Yes                    | PostgreSQL connection string                      |
| `TOKEN_SECRET`                    | Yes                    | Signs login tokens (development has a default)    |
| `GCS_BUCKET`                      | Yes                    | Google Cloud Storage bucket for uploads           |
| `GCS_CLIENT_EMAIL`                | Yes                    | GCS service account email                         |
| `GCS_PRIVATE_KEY`                 | Yes                    | GCS service account private key                   |
| `YOUTUBE_API_KEY`                 | Yes                    | YouTube Data API key, for the video import job    |
| `APPLE_MUSIC_KEY_ID`              |                        | MusicKit key ID, for album covers                 |
| `APPLE_MUSIC_TEAM_ID`             |                        | Apple Developer team ID                           |
| `APPLE_MUSIC_PRIVATE_KEY`         |                        | MusicKit private key (the .p8 file's contents)    |
| `GOOGLE_MAPS_GEOLOCATION_API_KEY` |                        | Google Maps key for venue maps and geocoding      |
| `TICKETMASTER_API_KEY`            |                        | Ticketmaster Discovery API key for venue listings |

### Refresh from production

Replace the local database with a fresh production snapshot:

```bash
# One-time Railway CLI setup
railway login
railway link

# From the monorepo root
pnpm db:refresh
```

The command reads the public database URL from the Railway `Postgres` service in
the `production` environment, writes an ignored snapshot to
`graphql/dump/latest-production.dump`, replaces the local `public` schema, and
applies the current Prisma schema. It refuses to reset a `DATABASE_URL` whose
host is not loopback.

If the Railway database service has a different name, set
`RAILWAY_DATABASE_SERVICE`. You can bypass Railway discovery with an explicit
`PRODUCTION_DATABASE_URL`:

```bash
RAILWAY_DATABASE_SERVICE=database pnpm db:refresh
PRODUCTION_DATABASE_URL='postgresql://…' pnpm db:refresh
```

## Development

```bash
pnpm dev
# Server starts at http://localhost:8081/graphql
```

Uses `tsx watch` for hot reloading. Run `pnpm dev` from the monorepo root to start the web app too.

## Production

```bash
# Build
pnpm build

# Start
pnpm start
```

`build` generates the Prisma client and bundles with esbuild to `dist/index.js`. `start` runs the bundled server with Node.

## Scripts

| Script                       | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `pnpm dev`                   | Start in development with watch mode                |
| `pnpm build`                 | Generate Prisma client and bundle for production    |
| `pnpm start`                 | Start the production server                         |
| `pnpm db:generate`           | Generate Prisma client                              |
| `pnpm db:migrate`            | Run Prisma migrations                               |
| `pnpm db:push`               | Push schema to database                             |
| `pnpm db:studio`             | Open Prisma Studio                                  |
| `pnpm db:dump`               | Dump database to seed file                          |
| `pnpm db:refresh`            | Replace local data with a fresh production snapshot |
| `pnpm db:setup`              | Create, update, and seed the database if it's empty |
| `pnpm db:reset`              | Drop the database and set it up again from the seed |
| `pnpm typecheck`             | Type-check with TypeScript                          |

## Project Structure

```
src/
├── index.ts          # Entry point: starts observability, then server.ts
├── server.ts         # Node HTTP server, Apollo Server and request logging
├── app.ts            # Routes and middleware (Remix router)
├── authentication.ts # JWT authentication middleware
├── database/         # Prisma client
├── models/           # Data access layer
├── resolvers/        # GraphQL resolvers
├── schema/           # GraphQL type definitions
├── uploads/          # Media upload handling
├── utils/            # Utility functions
└── jobs/             # Scheduled tasks (cron)
tools/
├── database/         # Seed dump, reset, and production refresh scripts
├── editor/           # Post editor content conversions
├── apple-music/      # Apple Music lookups
├── websites/         # Show listing scrapers
├── youtube.ts        # YouTube data tools
├── shows.ts          # Show data tools
├── addresses.ts      # Venue address tools
└── listings-urls.ts  # Venue listing page URLs
dump/
└── highforthis-seed.dump  # pg_dump used by db:reset
prisma/
└── schema.prisma     # Database schema
prisma.config.ts      # Prisma configuration
```
