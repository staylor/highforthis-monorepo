import pg from 'pg';
import { createPostgresDatabase } from 'remix/data-table/postgres';

import env from '#/env';

const TIMESTAMP = pg.types.builtins.TIMESTAMP;

// Prisma keeps `timestamp without time zone` columns in UTC, and pg reads and writes them in the
// server's time zone, so a date would move by its offset. Read them as UTC on this pool…
const types = {
  getTypeParser: ((oid, format) =>
    oid === TIMESTAMP && format !== 'binary'
      ? (value: string) => new Date(`${value.replace(' ', 'T')}Z`)
      : pg.types.getTypeParser(oid, format)) as typeof pg.types.getTypeParser,
};

// …and write dates as UTC. pg has no per-pool setting for this. Prisma sends its dates as text,
// so this doesn't change how it writes them.
pg.defaults.parseInputDatesAsUTC = true;

// remix/data-table, beside the Prisma client while the resolvers move over one at a time
const db = createPostgresDatabase({ connectionString: env.DATABASE_URL, types });

export default db;
