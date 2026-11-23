import { createLogger } from '@highforthis/shared/logger';

import env from '#/env';

import { createDatabase } from './postgres';

const logger = createLogger({ serviceName: 'graphql' });

// remix/data-table, beside the Prisma client while the resolvers move over one at a time
const db = createDatabase(env.DATABASE_URL, (error) =>
  logger.warn({ err: error }, 'An idle database connection failed')
);

export default db;
