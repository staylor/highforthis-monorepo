import prisma from '~/database';

const venues = await prisma.venue.findMany({ take: 1000 });

const trim = (str: string) => str.replace(/^\s+|\s+$/g, '');

for (const venue of venues) {
  if (venue.streetAddress) {
    console.log('Already parsed:', venue.name);
    continue;
  }

  // Reconstruct the old-style address field
  const address = [venue.streetAddress, [venue.city, venue.state, venue.postalCode].filter(Boolean).join(', ')].filter(Boolean).join('\n');
  if (!address) {
    console.log('Missing address:', venue.name);
    continue;
  }

  const parts = trim(address).split('\n');
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
  await prisma.venue.update({
    where: { id: venue.id },
    data: { streetAddress, city, state, postalCode },
  });
}

process.exit(0);
