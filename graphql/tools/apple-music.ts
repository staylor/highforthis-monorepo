import prisma from '#/database';
import { fillAppleMusic } from '#/resolvers/utils/appleMusicData';

// Looks up Apple Music's data for every artist that has none, as saving an artist does for that
// one artist: pnpm --filter @highforthis/graphql tools:script:dev tools/apple-music.ts

const artists = await prisma.artist.findMany({
  where: { appleMusic: { is: null } },
  select: { id: true },
});
const ids = artists.map(({ id }) => id);
const saved = await fillAppleMusic(ids);
const missing = await prisma.artist.findMany({
  where: { id: { in: ids }, appleMusic: { is: null } },
  select: { name: true },
  orderBy: { name: 'asc' },
});

console.log(`Saved Apple Music's data to ${saved} of ${ids.length} artists.`);
if (missing.length) {
  console.log('Still without it:', missing.map(({ name }) => name).join(', '));
}

process.exit(0);
