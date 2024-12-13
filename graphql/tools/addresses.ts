import database from '~/database';
import Venue from '~/models/Venue';

const { db } = await database();
const model = new Venue({ db });
const venues = await model.all({ limit: 1000 });

const trim = (str: string) => str.replace(/^\s+|\s+$/g, '');

for (const venue of venues) {
  if (venue.streetAddress) {
    console.log('Already parsed:', venue.name);
    continue;
  }

  if (!venue.address) {
    console.log('Missing address:', venue.name);
    continue;
  }

  const parts = trim(venue.address).split('\n');
  if (parts.length !== 2) {
    console.log('Malformed:', parts);
    continue;
  }

  const [streetAddress, cityStateZip] = parts.map(trim);
  const [city, stateZip] = cityStateZip.split(',').map(trim);
  const matches = stateZip.match(/[0-9]{5}(:?-[0-9]{4})?$/);
  if (!matches) {
    console.log('No zip code:', venue.name);
    continue;
  }
  const [postalCode] = matches;
  const state = trim(stateZip.replace(postalCode, ''));

  console.log('Saving new address data:', venue.name);
  const id = String(venue._id);
  await model.updateById(id, {
    streetAddress,
    city,
    state,
    postalCode,
  });
}

process.exit(0);
