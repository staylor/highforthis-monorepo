import fs from 'fs';
import path from 'path';

import prisma from '~/database';

const API_KEY = process.env.GOOGLE_MAPS_GEOLOCATION_API_KEY as string;

const apiUrl = (address: string) =>
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${API_KEY}`;

const filename = (id: string) =>
  path.join(process.cwd(), 'tools', 'geolocation', 'responses', `${id}.json`);

const fileExists = (id: string) => fs.existsSync(filename(id));

const venues = await prisma.venue.findMany({ take: 200 });

for (const venue of venues) {
  if (!venue.streetAddress) {
    console.log('No address for: ', venue.name);
    continue;
  }

  const { id } = venue;
  if (fileExists(id)) {
    if (venue.latitude && venue.longitude) {
      // console.log('Coordinates already set for: ', venue.name);
    } else {
      const coordinates = await import(filename(id));

      console.log('Setting coordinates for: ', venue.name);
      await prisma.venue.update({
        where: { id },
        data: {
          latitude: coordinates.default.latitude,
          longitude: coordinates.default.longitude,
        },
      });
    }
    continue;
  }

  if (!API_KEY) {
    throw new Error('GOOGLE_MAPS_GEOLOCATION_API_KEY must be set');
  }

  const address = `${venue.streetAddress}, ${venue.city}, ${venue.state} ${venue.postalCode}`;

  const geolocation = await fetch(apiUrl(address))
    .then((response) => response.json())
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

  await prisma.venue.update({
    where: { id },
    data: coordinates,
  });

  console.log('Saving:', venue.name, coordinates);
  fs.writeFileSync(filename(id), JSON.stringify(coordinates, null, 2));
}

process.exit(0);
