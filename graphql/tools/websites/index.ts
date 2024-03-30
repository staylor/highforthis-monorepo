import fs from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';

import database from '../../src/database';
import Term from '../../src/models/Term';

const venuesHost = 'https://www.ohmyrockness.com';
const allVenuesURL = `${venuesHost}/venues/all`;
const allFilename = path.join(process.cwd(), 'tools', 'websites', 'responses', 'all.html');

const filename = (name: string) => path.join(process.cwd(), 'tools', 'websites', 'responses', name);

const { db } = await database();
const term = new Term({ db });
const venues = await term.all({ taxonomy: 'venue', limit: 200 });

async function readOrFetch(url: string, filename: string) {
  let html: string;
  if (fs.existsSync(filename)) {
    console.log('Reading saved HTML output of', url);
    html = fs.readFileSync(filename, { encoding: 'utf-8' });
  } else {
    html = await fetch(url).then((response) => response.text());
    console.log('Saving HTML output of', url);
    fs.writeFileSync(filename, html);
  }
  return html;
}

const allVenuesHTML = await readOrFetch(allVenuesURL, allFilename);
const dom = new JSDOM(allVenuesHTML);
const index = new Map();
const venueLinks = [...dom.window.document.querySelectorAll('.omrlink')];
if (venueLinks.length === 0) {
  console.log('No venue links found.');
} else {
  console.log('Found', venueLinks.length, 'venues in HTML.');
}

(venueLinks as HTMLAnchorElement[]).forEach(({ href, textContent }) => {
  const search = textContent?.trim().toLowerCase();
  if (!search) {
    return;
  }
  index.set(search, {
    path: href,
    name: textContent,
  });
});

for (const venue of venues) {
  const venueId = String(venue._id);
  const websiteFilename = filename(`${venueId}-website.json`);
  if (fs.existsSync(websiteFilename)) {
    if (!venue.website) {
      console.log('Saving website to:', venueId);
      const { default: website } = await import(websiteFilename);
      await term.updateById(venueId, {
        website,
      });
    }
    continue;
  }

  const search = venue.name.trim().toLowerCase();
  if (!index.has(search)) {
    continue;
  }

  const matched = index.get(search);
  const html = await readOrFetch(
    `${venuesHost}${matched.path}`,
    filename(`${venueId}-output.html`)
  );
  const venueDOM = new JSDOM(html);
  const venueLink = venueDOM.window.document.querySelector('.venue-link');
  if (!venueLink) {
    continue;
  }

  const website = (venueLink as HTMLAnchorElement).href;
  if (website) {
    console.log(`Found match for ${venue.name}:`, website);
    fs.writeFileSync(websiteFilename, JSON.stringify(website) + '\n');
    console.log('Saving website to:', venueId);
    await term.updateById(venueId, {
      website,
    });
  }
}
process.exit(0);
