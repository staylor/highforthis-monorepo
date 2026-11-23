import fs from 'fs';
import path from 'path';

import { developerToken } from '#/appleMusic';
import prisma from '#/database';

const searchUrl = (term: string) =>
  `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(term)}`;

const search = (term: string) =>
  fetch(searchUrl(term), {
    headers: {
      Authorization: `Bearer ${developerToken()}`,
    },
  })
    .then((response) => response.json())
    .then(({ results }) => {
      const data = results?.artists?.data;
      if (!data) {
        return;
      }
      const [artist] = data;
      return artist;
    });

// Saves Apple Music's data to the artists that have none, over two runs: the first writes what
// Apple Music finds for each of them to `responses`, and the second saves those to the artists.
// pnpm --filter @highforthis/graphql tools:script:dev tools/apple-music/search/index.ts
const responses = path.join(process.cwd(), 'tools', 'apple-music', 'search', 'responses');

const filename = (id: string) => path.join(responses, `${id}.json`);

const fileExists = (id: string) => fs.existsSync(filename(id));

async function main() {
  fs.mkdirSync(responses, { recursive: true });
  const artists = await prisma.artist.findMany({
    where: { appleMusic: { is: null } },
    include: { appleMusic: true },
  });

  for (const artist of artists) {
    const { id } = artist;
    if (fileExists(id)) {
      if (!artist.appleMusic) {
        const data = await import(filename(id));
        const { url, genreNames, artwork } = data.attributes;

        console.log('Setting appleMusic for: ', id);
        await prisma.appleMusicData.create({
          data: {
            artistId: id,
            appleId: data.id,
            url,
            genreNames: {
              create: (genreNames || []).map((name: string) => ({ name })),
            },
            artwork: artwork ? { create: artwork } : undefined,
          },
        });
      }
      continue;
    }

    const response = await search(artist.name);
    if (!response) {
      console.log('No response for:', artist.name);
      continue;
    }
    console.log('Writing file for:', artist.name);
    fs.writeFileSync(filename(id), JSON.stringify(response, null, 2));
  }
}

await main();
process.exit(0);
