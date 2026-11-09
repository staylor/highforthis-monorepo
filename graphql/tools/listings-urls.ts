import prisma from '#/database';

// Sets the listings page of the venues shows get recommended at, unless one is already set:
// pnpm --filter @highforthis/graphql tools:script:dev tools/listings-urls.ts

const TICKETMASTER = 'https://www.ticketmaster.com';

const listingsUrls: Record<string, string> = {
  'Apollo Theater': `${TICKETMASTER}/the-apollos-historic-theater-tickets-new-york/venue/6`,
  'Asbury Lanes': 'https://bowerypresents.com/asbury-lanes/',
  'Barclays Center': `${TICKETMASTER}/barclays-center-tickets-brooklyn/venue/393376`,
  'Beacon Theatre': `${TICKETMASTER}/beacon-theatre-tickets-new-york/venue/483425`,
  'Blue Note': `${TICKETMASTER}/blue-note-jazz-club-tickets-new-york/venue/1068`,
  'Bowery Ballroom': `${TICKETMASTER}/bowery-ballroom-tickets-new-york/venue/1100`,
  'Brooklyn Bowl': `${TICKETMASTER}/brooklyn-bowl-tickets-brooklyn/venue/1394`,
  'Brooklyn Paramount': `${TICKETMASTER}/brooklyn-paramount-tickets-brooklyn/venue/1367`,
  'Brooklyn Steel': 'https://bowerypresents.com/brooklyn-steel/',
  'Citi Field': `${TICKETMASTER}/citi-field-tickets-queens/venue/237674`,
  'Forest Hills Stadium': 'https://foresthillsstadium.com/',
  'Gramercy Theatre': `${TICKETMASTER}/gramercy-theatre-tickets-new-york/venue/107`,
  'Hammerstein Ballroom': `${TICKETMASTER}/manhattan-center-hammerstein-ballroom-tickets-new-york/venue/280`,
  'House of Independents': `${TICKETMASTER}/house-of-independents-tickets-asbury-park/venue/340264`,
  'Irving Plaza': `${TICKETMASTER}/irving-plaza-powered-by-verizon-5g-tickets-new-york/venue/47`,
  'Jones Beach Theater': `${TICKETMASTER}/northwell-at-jones-beach-theater-tickets-wantagh/venue/237654`,
  'Kings Theatre': `${TICKETMASTER}/kings-theatre-tickets-brooklyn/venue/393357`,
  // Bowery Presents' shows, from its shared feed; Ticketmaster lists fewer
  'Knockdown Center':
    'https://aegwebprod.blob.core.windows.net/json/events/59/events.json?venue=126624',
  'Madison Square Garden': `${TICKETMASTER}/madison-square-garden-tickets-new-york/venue/483329`,
  'Mercury Lounge': `${TICKETMASTER}/mercury-lounge-tickets-new-york/venue/1101`,
  'MetLife Stadium': `${TICKETMASTER}/metlife-stadium-tickets-east-rutherford/venue/1233`,
  'Music Hall of Williamsburg': 'https://www.bowerypresents.com/music-hall-of-williamsburg/',
  'New Jersey Performing Arts Center': `${TICKETMASTER}/new-jersey-performing-arts-center-tickets-newark/venue/308`,
  'PNC Bank Arts Center': `${TICKETMASTER}/pnc-bank-arts-center-tickets-holmdel/venue/16839`,
  'Prudential Center': `${TICKETMASTER}/prudential-center-tickets-newark/venue/16847`,
  Racket: 'https://racketnyc.com/',
  'Radio City Music Hall': `${TICKETMASTER}/radio-city-music-hall-tickets-new-york/venue/491523`,
  "Randall's Island": `${TICKETMASTER}/randalls-island-tickets-new-york/venue/722`,
  SPAC: `${TICKETMASTER}/albany-med-health-system-at-spac-tickets-saratoga-springs/venue/97`,
  'Sony Hall': `${TICKETMASTER}/sony-hall-tickets-new-york/venue/1475`,
  Sphere: `${TICKETMASTER}/sphere-tickets-las-vegas/venue/189524`,
  'Starland Ballroom': 'https://www.starlandballroom.com/',
  'Tarrytown Music Hall': `${TICKETMASTER}/tarrytown-music-hall-tickets-tarrytown/venue/122`,
  'Terminal 5': 'https://bowerypresents.com/terminal-5/',
  'The Bell House': `${TICKETMASTER}/the-bell-house-tickets-brooklyn/venue/393383`,
  'The Capitol Theatre': `${TICKETMASTER}/the-capitol-theatre-tickets-port-chester/venue/237773`,
  'The Rooftop at Pier 17': `${TICKETMASTER}/the-rooftop-at-pier-17-tickets-new-york/venue/1246`,
  'The Stone Pony': `${TICKETMASTER}/the-stone-pony-tickets-asbury-park/venue/112`,
  'The Theatre at Madison Square Garden': `${TICKETMASTER}/infosys-theater-at-madison-square-garden-tickets-new-york/venue/483330`,
  'Town Hall': `${TICKETMASTER}/town-hall-tickets-new-york/venue/24622`,
  'UBS Arena': `${TICKETMASTER}/ubs-arena-tickets-belmont-park/venue/393369`,
  'Under the K Bridge Park': 'https://bowerypresents.com/under-the-k-bridge-park/',
  Warsaw: `${TICKETMASTER}/warsaw-tickets-brooklyn/venue/24`,
  'Webster Hall': 'https://www.websterhall.com/',
  'Westville Music Bowl': `${TICKETMASTER}/westville-music-bowl-tickets-new-haven/venue/237863`,
  'White Eagle Hall': `${TICKETMASTER}/white-eagle-hall-tickets-jersey-city/venue/341327`,
  'Yankee Stadium': `${TICKETMASTER}/yankee-stadium-tickets-bronx/venue/237572`,
};

for (const [name, listingsUrl] of Object.entries(listingsUrls)) {
  const venue = await prisma.venue.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
  if (!venue) {
    console.log('No venue named', name);
  } else if (venue.listingsUrl) {
    console.log('Already set:', name, venue.listingsUrl);
  } else {
    await prisma.venue.update({ where: { id: venue.id }, data: { listingsUrl } });
    console.log('Set', name, listingsUrl);
  }
}

process.exit(0);
