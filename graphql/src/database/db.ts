import { createLogger } from '@highforthis/shared/logger';

import env from '#/env';

import { createDatabase } from './postgres';

const logger = createLogger({ serviceName: 'graphql' });

// The server's database, through remix/data-table
const db = createDatabase(env.DATABASE_URL, (error) =>
  logger.warn({ err: error }, 'An idle database connection failed')
);

export default db;
