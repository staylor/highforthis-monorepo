import prisma from '#/database';

async function cleanupShows() {
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
