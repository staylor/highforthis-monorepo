import fs from 'fs';
import path from 'path';

import database from '../../src/database';
import Term from '../../src/models/Term';

const API_KEY = process.env.GOOGLE_MAPS_GEOLOCATION_API_KEY as string;
if (!API_KEY) {
  throw new Error('GOOGLE_MAPS_GEOLOCATION_API_KEY must be set');
}

const apiUrl = (address: string) =>
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${API_KEY}`;

const filename = (id: string) =>
  path.join(process.cwd(), 'tools', 'geolocation', 'responses', `${id}.json`);

const fileExists = (id: string) => fs.existsSync(filename(id));

const { db } = await database();
const term = new Term({ db });
const venues = await term.all({ taxonomy: 'venue', limit: 200 });

for (const venue of venues) {
  if (!venue.address) {
    continue;
  }

  const id = String(venue._id);
  if (fileExists(id)) {
    if (!venue.coordinates) {
      const coordinates = await import(filename(id));

      console.log('Setting coordinates for: ', id);
      await term.updateById(id, {
        coordinates: coordinates.default,
      });
    }
    continue;
  }

  const geolocation = await fetch(apiUrl(venue.address))
    .then(response => response.json())
    .then(({ results }) => {
      if (results.length > 0) {
        const [result] = results;
        if (!result.geometry) {
          return;
        }
        return result.geometry.location;
      }
      return;
    });
  if (!geolocation) {
    continue;
  }

  const coordinates = {
    latitude: geolocation.lat,
    longitude: geolocation.lng,
  };

  await term.updateById(id, {
    coordinates,
  });

  console.log('Saving:', venue.name, coordinates);
  fs.writeFileSync(filename(id), JSON.stringify(coordinates, null, 2));
}

process.exit(0);
