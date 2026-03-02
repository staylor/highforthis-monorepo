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

# Configure environment variables
cp .env.example .env  # then fill in values
```

### Environment Variables

| Variable                          | Description                      |
| --------------------------------- | -------------------------------- |
| `DATABASE_URL`                    | PostgreSQL connection string     |
| `TOKEN_KEY`                       | JWT token key                    |
| `TOKEN_SECRET`                    | JWT token secret                 |
| `YOUTUBE_API_KEY`                 | YouTube Data API key             |
| `GCS_BUCKET`                      | Google Cloud Storage bucket name |
| `GCS_CLIENT_EMAIL`                | GCS service account email        |
| `GCS_PRIVATE_KEY`                 | GCS service account private key  |
| `APPLE_MUSIC_AUTH_KEY_PATH`       | Path to Apple Music auth key     |
| `APPLE_MUSIC_KEY_ID`              | Apple Music key ID               |
| `APPLE_MUSIC_TEAM_ID`             | Apple Music team ID              |
| `GOOGLE_MAPS_GEOLOCATION_API_KEY` | Google Maps geolocation API key  |

### PostgreSQL (macOS)

Install PostgreSQL via Homebrew:

```bash
brew install postgresql@17
```

Versioned formulae aren't linked to `/opt/homebrew/bin` by default. Add PostgreSQL to your PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Start the service:

```bash
brew services start postgresql@17
```

Create a database and user:

```bash
psql postgres <<SQL
CREATE USER hft_user WITH PASSWORD 'hft_pass';
CREATE DATABASE highforthis OWNER hft_user;
SQL
```

Set `DATABASE_URL` in your `.env` file:

```
DATABASE_URL="postgresql://hft_user:hft_pass@localhost:5432/highforthis"
```

Push the Prisma schema to create tables, then restore the seed data:

```bash
pnpm db:push
pg_restore --no-owner --no-privileges --data-only --disable-triggers \
  -U hft_user -d highforthis dump/highforthis-seed.dump
```

The `--disable-triggers` flag disables foreign key checks during restore so tables can be loaded in any order. This requires the user to have superuser privileges — grant them before restoring, then revoke after:

```bash
psql postgres -c "ALTER USER hft_user WITH SUPERUSER;"
# run pg_restore above
psql postgres -c "ALTER USER hft_user WITH NOSUPERUSER;"
```

### Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (no migrations)
pnpm db:push

# Create a migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

## Development

```bash
pnpm dev
# Server starts at http://localhost:8080/graphql
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

| Script                       | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `pnpm dev`                   | Start in development with watch mode          |
| `pnpm build`                 | Generate Prisma client and bundle for production |
| `pnpm start`                 | Start the production server                   |
| `pnpm db:generate`           | Generate Prisma client                        |
| `pnpm db:migrate`            | Run Prisma migrations                         |
| `pnpm db:push`               | Push schema to database                       |
| `pnpm db:studio`             | Open Prisma Studio                            |
| `pnpm db:dump`               | Dump database to seed file                    |
| `pnpm db:reset`              | Drop, recreate, and seed the database         |
| `pnpm db:migrate-from-mongo` | Import data from MongoDB dump into PostgreSQL |
| `pnpm typecheck`             | Type-check with TypeScript                    |

## Data Migration (MongoDB → PostgreSQL)

The `dump/` directory contains data for migrating from the original MongoDB database:

```
dump/
├── highforthis-prod/      # Raw BSON files from mongodump
├── json/                  # JSONL files converted from BSON (used by import script)
└── highforthis-seed.dump  # pg_dump for seeding a fresh PostgreSQL database
```

### Full migration from BSON

```bash
# 1. Convert BSON to JSONL (requires mongodb-database-tools)
for bson in dump/highforthis-prod/*.bson; do
  name=$(basename "$bson" .bson)
  bsondump --type=json "$bson" > "dump/json/${name}.jsonl"
done

# 2. Reset database and push schema
pnpm db:push

# 3. Run migration (includes editor state fix and content body backfill)
pnpm db:migrate-from-mongo
```

### Seeding PostgreSQL on Debian (production)

#### 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-client
```

#### 2. Start and enable the service

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 3. Create a database and user

```bash
sudo -u postgres psql <<SQL
CREATE USER highforthis WITH PASSWORD 'your_secure_password';
CREATE DATABASE highforthis OWNER highforthis;
GRANT ALL PRIVILEGES ON DATABASE highforthis TO highforthis;
SQL
```

#### 4. Set `DATABASE_URL` in `.env.production`

```
DATABASE_URL="postgresql://highforthis:your_secure_password@localhost:5432/highforthis"
```

#### 5. Push the Prisma schema to create tables

```bash
pnpm db:push
```

#### 6. Restore the seed data

```bash
pg_restore --no-owner --no-privileges --data-only \
  -U highforthis -d highforthis dump/highforthis-seed.dump
```

If you get a password prompt, you can add the connection to `~/.pgpass`:

```
localhost:5432:highforthis:highforthis:your_secure_password
```

#### 7. Verify

```bash
psql -U highforthis -d highforthis -c "SELECT count(*) FROM \"Artist\";"
```

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
├── migrate-from-mongo.ts  # MongoDB → PostgreSQL migration
├── youtube.ts             # YouTube data tools
├── shows.ts               # Show data tools
└── addresses.ts           # Venue address tools
prisma/
├── schema.prisma          # Database schema
prisma.config.ts           # Prisma configuration
```
