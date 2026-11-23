import { createLogger } from '@highforthis/shared/logger';

import prisma from '#/database';

const logger = createLogger({ serviceName: 'graphql' });

/** Removes the shows from more than 180 days ago that weren't attended. */
async function cleanupShows() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
  const { count } = await prisma.show.deleteMany({
    where: {
      date: { lt: sixMonthsAgo },
      attended: false,
    },
  });
  if (count) {
    logger.info({ removed: count }, 'Removed old shows that were not attended');
  }
}

export default cleanupShows;
