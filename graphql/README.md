# @highforthis/graphql

GraphQL API server for High For This, built with Apollo Server, Express, and Prisma with PostgreSQL.

## Stack

- **[Apollo Server](https://www.apollographql.com/docs/apollo-server/)** — GraphQL server
- **[Express](https://expressjs.com/)** — HTTP server
- **[Prisma](https://www.prisma.io/)** — ORM with PostgreSQL adapter (`@prisma/adapter-pg`)
- **JWT** — Authentication via `jsonwebtoken` and `bcryptjs`

## Setup

```bash
# From the monorepo root
pnpm install

# Create graphql/.env with the variables below
```

### Environment Variables

| Variable                          | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| `DATABASE_URL`                    | PostgreSQL connection string                      |
| `TOKEN_SECRET`                    | JWT token secret                                  |
| `YOUTUBE_API_KEY`                 | YouTube Data API key                              |
| `GCS_BUCKET`                      | Google Cloud Storage bucket name                  |
| `GCS_CLIENT_EMAIL`                | GCS service account email                         |
| `GCS_PRIVATE_KEY`                 | GCS service account private key                   |
| `APPLE_MUSIC_KEY_ID`              | MusicKit key ID, for album covers                 |
| `APPLE_MUSIC_TEAM_ID`             | Apple Developer team ID                           |
| `APPLE_MUSIC_PRIVATE_KEY`         | MusicKit private key (the .p8 file's contents)    |
| `GOOGLE_MAPS_GEOLOCATION_API_KEY` | Google Maps key for venue maps and geocoding      |
| `TICKETMASTER_API_KEY`            | Ticketmaster Discovery API key for venue listings |

### PostgreSQL (macOS)

Install PostgreSQL 18 with Homebrew. The seed dump is made with 18, and `pg_restore` can't read dumps from a newer version than itself.

```bash
brew install postgresql@18
```

Versioned formulae aren't linked to `/opt/homebrew/bin` by default. Add PostgreSQL to your PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Start the service:

```bash
brew services start postgresql@18
```

Create a user and database:

```bash
psql postgres <<SQL
CREATE USER hft_user WITH PASSWORD 'hft_pass';
CREATE DATABASE highforthis OWNER hft_user;
SQL
```

Set `DATABASE_URL` in `graphql/.env`:

```
DATABASE_URL="postgresql://hft_user:hft_pass@localhost:5432/highforthis"
```

Load the seed data:

```bash
pnpm db:reset
```

This drops and recreates the database, pushes the Prisma schema, and restores `dump/highforthis-seed.dump`. It briefly makes the database user a superuser so the restore can disable foreign key triggers.

The schema is applied with `prisma db push`; there are no migration files. Railway's pre-deploy command runs the same push against production.

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

Uses `tsx watch` for hot reloading.

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
| `pnpm db:reset`              | Drop, recreate, and seed the database               |
| `pnpm typecheck`             | Type-check with TypeScript                          |

## Project Structure

```
src/
├── index.ts          # Express + Apollo Server entry point
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
