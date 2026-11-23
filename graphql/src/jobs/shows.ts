import { and, lt } from 'remix/data-table';

import { createLogger } from '@highforthis/shared/logger';

import db from '#/database/db';
import { shows } from '#/database/tables';

const logger = createLogger({ serviceName: 'graphql' });

/** Removes the shows from more than 180 days ago that weren't attended. */
async function cleanupShows() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
  const { affectedRows } = await db.deleteMany(shows, {
    where: and(lt('date', sixMonthsAgo), { attended: false }),
  });
  if (affectedRows) {
    logger.info({ removed: affectedRows }, 'Removed old shows that were not attended');
  }
}

export default cleanupShows;
