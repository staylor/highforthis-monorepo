import type { PrismaClient } from '@prisma/client';

async function cleanupShows(prisma: PrismaClient) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
  const result = await prisma.show.deleteMany({
    where: {
      date: { lt: sixMonthsAgo },
      attended: false,
    },
  });
  console.log('[Shows]', result);
}

export default cleanupShows;
