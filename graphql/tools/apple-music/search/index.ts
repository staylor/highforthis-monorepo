import fs from 'fs';
import path from 'path';

import database from '../../../src/database';
import Term from '../../../src/models/Term';
import jwtToken from '../jwt';

const searchUrl = (term: string) =>
  `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(term)}`;

const search = (term: string) =>
  fetch(searchUrl(term), {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
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
  const { db } = await database();
  const term = new Term({ db });
  const artists = await term.all({ taxonomy: 'artist', limit: 1000 });

  for (const artist of artists) {
    const id = String(artist._id);
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
        await term.updateById(id, {
          appleMusic,
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
