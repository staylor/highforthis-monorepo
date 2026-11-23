# @highforthis/graphql

GraphQL API server for High For This, built with Apollo Server, Remix's Fetch API server packages, and PostgreSQL through `remix/data-table`.

## Stack

- **[Apollo Server](https://www.apollographql.com/docs/apollo-server/)** — GraphQL server
- **[Remix](https://remix.run/)** — HTTP server: `remix/node-fetch-server` and `remix/router`, with Remix's CORS and compression middleware, and `remix/form-data-parser` for uploads
- **[`remix/data-table`](https://github.com/remix-run/remix/tree/main/packages/data-table)** — queries and writes, with `pg`, and the SQL migrations that make the tables
- **JWT** — Sign-in with a password (`bcryptjs`) or a passkey (`@simplewebauthn/server`), and a session token signed with `jsonwebtoken`

## Setup

From the monorepo root, `pnpm bootstrap` sets everything up, and `pnpm dev` starts GraphQL with the web app. See the [root README](../README.md#setup).

Bootstrap installs PostgreSQL 18 from the `Brewfile`, creates `graphql/.env` from [`.env.example`](.env.example), and runs `pnpm db:setup`. That creates the database if it's missing, applies the [migrations](#migrations), and loads `dump/highforthis-seed.dump` into an empty database. It's safe to run again; existing data is kept. The seed has no users: `pnpm e2e:admin` creates an admin to sign in with locally.

`DATABASE_URL` connects as your macOS user, which Homebrew's Postgres sets up as a superuser with no password. Loading the seed needs a superuser, because the restore disables foreign key triggers.

### Migrations

The tables come from the SQL migrations in [`migrations/`](migrations). `pnpm db:migrate` applies the ones a database hasn't had, through [`remix db migrate`](https://github.com/remix-run/remix/tree/main/packages/data-table#migrations) and the settings in [`remix.json`](remix.json), and Railway's pre-deploy command runs it against production before a new version starts.

Each migration is a directory named for when it was written and what it does, such as `20261123000000_baseline`, with an `up.sql` and, if it can be undone, a `down.sql`. It runs in a transaction, and the `data_table_migrations` table records it with a checksum of its `up.sql`. `db:migrate` stops if a migration that has run has changed since, so once one has reached production, a change to the tables is a new migration.

To change the tables:

1. Add `migrations/<UTC time>_<what it does>/up.sql`, named with a 14-digit time like the others so the migrations sort in order: `date -u +%Y%m%d%H%M%S` prints one. Add a `down.sql` that undoes it, too.
2. Run `pnpm db:migrate`. To change a migration that hasn't reached production, `pnpm db:rollback` undoes it first.
3. Describe the change in [`src/database/tables.ts`](src/database/tables.ts), which queries use, and run `pnpm db:check`. It compares `tables.ts` with the database's tables, columns, types, nullability and primary keys, and CI runs it on a database it has just migrated.
4. If the change is to a table the seed fills, run `pnpm db:dump`, so `db:setup` and `db:reset` can load the seed into the new tables.

The first migration, `20261123000000_baseline`, makes the tables as `prisma db push` left them. A database `prisma db push` built, such as production's, already has them, so there it only records itself.

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
| `APPLE_MUSIC_KEY_ID`              |                        | MusicKit key ID, for album covers and artist data |
| `APPLE_MUSIC_TEAM_ID`             |                        | Apple Developer team ID                           |
| `APPLE_MUSIC_PRIVATE_KEY`         |                        | MusicKit private key (the .p8 file's contents)    |
| `GOOGLE_MAPS_GEOLOCATION_API_KEY` |                        | Google key for geocoding addresses (server only)  |
| `GOOGLE_MAPS_BROWSER_API_KEY`     |                        | Public key for venue maps: Maps Static API only   |
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
applies the branch's migrations that production hasn't had. It refuses to reset a
`DATABASE_URL` whose host is not loopback.

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

`build` bundles with esbuild to `dist/index.js`. `start` runs the bundled server with Node.

## Scripts

| Script                       | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `pnpm dev`                   | Start in development with watch mode                |
| `pnpm build`                 | Bundle for production                               |
| `pnpm start`                 | Start the production server                         |
| `pnpm db:migrate`            | Apply the migrations the database hasn't had        |
| `pnpm db:status`             | List the migrations and whether each has run        |
| `pnpm db:rollback`           | Undo the newest migration                           |
| `pnpm db:check`              | Compare `src/database/tables.ts` with the database  |
| `pnpm db:dump`               | Dump database to seed file                          |
| `pnpm db:refresh`            | Replace local data with a fresh production snapshot |
| `pnpm db:setup`              | Create, update, and seed the database if it's empty |
| `pnpm db:reset`              | Drop the database and set it up again from the seed |
| `pnpm test`                  | Run the tests                                       |
| `pnpm typecheck`             | Type-check with TypeScript                          |

## Project Structure

```
src/
├── index.ts          # Entry point: starts observability, then server.ts
├── server.ts         # Node HTTP server, Apollo Server and request logging
├── app.ts            # Routes and middleware (Remix router)
├── authentication.ts # Password sign-in, sessions and the token middleware
├── passkeys.ts       # Passkey sign-in and registration
├── hardening.ts      # Query size limits and error masking
├── database/         # remix/data-table: the database and its tables
├── models/           # Shared types and unique slugs
├── resolvers/        # GraphQL resolvers
├── schema/           # GraphQL type definitions
├── listings/         # Venue listings from Bowery Presents/AEG and Ticketmaster
├── uploads/          # Media upload handling
├── utils/            # Utility functions
└── jobs/             # Scheduled tasks (cron)
tools/
├── database/         # Seed dump, reset, production refresh, and the tables.ts check
├── apple-music.ts    # Looks up Apple Music's data for the artists that have none
├── websites/         # A browser snippet that reads setlists from setlist.fm
├── youtube.ts        # Runs the YouTube import
├── shows.ts          # Runs the cleanup of old shows
└── listings-urls.ts  # Venue listing page URLs
dump/
└── highforthis-seed.dump  # pg_dump used by db:reset
migrations/           # The SQL migrations that make the tables
remix.json            # Where `remix db` finds the database and the migrations
```
