import prisma from '~/database';

async function logArtistStats() {
  const results = await prisma.showArtist.groupBy({
    by: ['artistId'],
    where: { show: { attended: true } },
    _count: { artistId: true },
  });

  const stats = await Promise.all(
    results.map(async (r) => {
      const artist = await prisma.artist.findUnique({ where: { id: r.artistId } });
      return { entity: artist?.name, count: r._count.artistId };
    })
  );

  console.log(
    'Artists:',
    stats.filter(({ count }) => count > 1).sort((a, b) => b.count - a.count)
  );
}

async function logVenueStats() {
  const results = await prisma.show.groupBy({
    by: ['venueId'],
    where: { attended: true },
    _count: { venueId: true },
  });

  const stats = await Promise.all(
    results.map(async (r) => {
      const venue = await prisma.venue.findUnique({ where: { id: r.venueId } });
      return { entity: venue?.name, count: r._count.venueId };
    })
  );

  console.log(
    'Venues:',
    stats.filter(({ count }) => count > 1).sort((a, b) => b.count - a.count)
  );
}

await Promise.all([logArtistStats(), logVenueStats()]);

process.exit(0);
