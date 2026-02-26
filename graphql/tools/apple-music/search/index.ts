import fs from 'fs';
import path from 'path';

import prisma from '~/database';

import { generateToken } from '../jwt';

const searchUrl = (term: string) =>
  `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(term)}`;

const search = (term: string) =>
  fetch(searchUrl(term), {
    headers: {
      Authorization: `Bearer ${generateToken()}`,
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

const filename = (id: string) =>
  path.join(process.cwd(), 'tools', 'apple-music', 'search', 'responses', `${id}.json`);

const fileExists = (id: string) => fs.existsSync(filename(id));

async function main() {
  const artists = await prisma.artist.findMany({ take: 1000 });

  for (const artist of artists) {
    const { id } = artist;
    if (fileExists(id)) {
      if (!artist.appleMusic) {
        const data = await import(filename(id));

        const { url, genreNames, artwork } = data.attributes;
        const appleMusic = {
          id: data.id,
          url,
          genreNames,
          artwork,
        };

        console.log('Setting appleMusic for: ', id);
        await prisma.artist.update({
          where: { id },
          data: { appleMusic },
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
