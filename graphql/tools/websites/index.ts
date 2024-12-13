import fs from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';
import type { WithId } from 'mongodb';

import database from '~/database';
import Artist from '~/models/Artist';
import Venue from '~/models/Venue';

const omrHost = 'https://www.ohmyrockness.com';
const filename = (name: string) => path.join(process.cwd(), 'tools', 'websites', 'responses', name);

const { db } = await database();
const artist = new Artist({ db });
const venue = new Venue({ db });

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

function getIndex(dom: JSDOM) {
  const index = new Map();
  const links = [...dom.window.document.querySelectorAll('.omrlink')];
  if (links.length === 0) {
    console.log('No links found.');
  } else {
    console.log('Found', links.length, 'venues in HTML.');
  }

  (links as HTMLAnchorElement[]).forEach(({ href, textContent }) => {
    const search = textContent?.trim().toLowerCase();
    if (!search) {
      return;
    }
    index.set(search, {
      path: href,
      name: textContent,
    });
  });
  return index;
}

interface Match {
  path: string;
  name: string;
}

async function parseTerms(
  model: any,
  terms: WithId<any>[],
  index: Map<string, Match>,
  selector: string
) {
  for (const item of terms) {
    const id = String(item._id);
    const websiteFilename = filename(`${id}-website.json`);
    if (fs.existsSync(websiteFilename)) {
      if (!item.website) {
        console.log('Saving website to:', id);
        const { default: website } = await import(websiteFilename);
        await model.updateById(id, {
          website,
        });
      }
      continue;
    }

    const search = item.name.trim().toLowerCase();
    if (!index.has(search)) {
      continue;
    }

    const matched = index.get(search) as Match;
    const html = await readOrFetch(`${omrHost}${matched.path}`, filename(`${id}-output.html`));
    const itemDOM = new JSDOM(html);
    const link = itemDOM.window.document.querySelector(selector);
    if (!link) {
      continue;
    }

    const website = (link as HTMLAnchorElement).href;
    if (website) {
      console.log(`Found match for ${item.name}:`, website);
      fs.writeFileSync(websiteFilename, JSON.stringify(website) + '\n');
      console.log('Saving website to:', id);
      await model.updateById(id, {
        website,
      });
    }
  }
}

async function fetchArtists() {
  const allArtistsURL = `${omrHost}/bands/all`;
  const allFilename = path.join(process.cwd(), 'tools', 'websites', 'responses', 'artists.html');

  const allArtistsHTML = await readOrFetch(allArtistsURL, allFilename);
  const dom = new JSDOM(allArtistsHTML);
  const index = getIndex(dom);
  const terms = await artist.all({ limit: 200 });

  await parseTerms(artist, terms, index, '#url .omrlink');
}

async function fetchVenues() {
  const allVenuesURL = `${omrHost}/venues/all`;
  const allFilename = path.join(process.cwd(), 'tools', 'websites', 'responses', 'venues.html');

  const allVenuesHTML = await readOrFetch(allVenuesURL, allFilename);
  const dom = new JSDOM(allVenuesHTML);
  const index = getIndex(dom);
  const terms = await venue.all({ limit: 200 });

  await parseTerms(venue, terms, index, '.venue-link');
}

await Promise.all([fetchArtists(), fetchVenues()]);

process.exit(0);
