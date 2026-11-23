import { fillAppleMusic, withoutAppleMusic } from '#/resolvers/utils/appleMusicData';

// Looks up Apple Music's data for every artist that has none, as saving an artist does for that
// one artist: pnpm --filter @highforthis/graphql tools:script:dev tools/apple-music.ts

const ids = (await withoutAppleMusic()).map(({ id }) => id);
const saved = await fillAppleMusic(ids);
const missing = await withoutAppleMusic(ids);

console.log(`Saved Apple Music's data to ${saved} of ${ids.length} artists.`);
if (missing.length) {
  console.log('Still without it:', missing.map(({ name }) => name).join(', '));
}

process.exit(0);
