import puppeteer from 'puppeteer';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import path from 'node:path';

import { slugify } from '~/models/utils';
import { jsonToPdf } from './pdf';
import { createDocxFile } from './docx';

const cwd = process.cwd();
const root = cwd.includes('/graphql') ? cwd : path.join(cwd, 'graphql');
const baseDir = path.join(root, 'tools', 'dead');

const lyricists = [
  ['robert-hunter', 'Robert Hunter', 'https://whitegum.com/cgi-bin/cgiwrap/acsa/findhun3.pl'],
  [
    'john-perry-barlow',
    'John Perry Barlow',
    'https://whitegum.com/cgi-bin/cgiwrap/acsa/findbarl.pl',
  ],
];

function getAuthorFile(slug: string) {
  const filename = `${slug}.json`;
  return path.join(baseDir, 'responses', filename);
}

function getSongFile(slug: string) {
  const songFile = `${slug}.json`;
  return path.join(baseDir, 'responses', 'lyrics', songFile);
}

function stripNotes(text: string) {
  return text.replaceAll(/\(note [a-zA-Z0-9]+?\)/g, '');
}

function getLyricsFromContent(content: string) {
  const dom = new JSDOM(content);
  const doc = dom.window.document;
  const title = doc.title;
  let authors = doc.querySelector('p')?.textContent?.trim().split('\n');
  if (authors) {
    authors = authors
      .filter((author) => author.includes('Music: ') || author.includes('Lyrics: '))
      .map(stripNotes);
  }
  const blockquotes = Array.from(doc.querySelectorAll('blockquote'));
  let lyrics = blockquotes[0]?.textContent?.trim();
  if (blockquotes.length > 1) {
    const notes = blockquotes
      .find((quote) => quote.innerHTML.includes('href="#note'))
      ?.textContent?.trim();
    // if the blockquote contains notes
    if (notes) {
      lyrics = notes;
      console.log(`${title} contains notes!`);
    } else {
      // find the largest blockquote
      lyrics = blockquotes
        .map(({ textContent }) => textContent?.trim() || '')
        .reduce((a: string, b: string) => (a.length > b.length ? a : b), '');
      console.log(`${title} has to guess by picking the largest :(`);
    }
  }
  if (!lyrics) {
    return { title, authors };
  }
  return { title, authors, lyrics: stripNotes(lyrics) };
}

function readJSON(file: string) {
  return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
}

function saveJSON(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Create JSON index of songs, so that this can be replayed idempotently without the network
for (const [slug, name, url] of lyricists) {
  const songsFile = getAuthorFile(slug);
  if (fs.existsSync(songsFile)) {
    console.log(`Songs file exists for ${name}`);
    continue;
  }

  console.log(`Extracting songs for ${name}`);

  await page.goto(url);

  const songs = await page.evaluate(() => {
    const songs = Array.from(document.querySelectorAll('td b a')) as HTMLAnchorElement[];
    return songs.map((song) => ({
      text: song.textContent?.trim() || '',
      url: song.href,
      slug: '',
    }));
  });
  // evaluate changes scope
  songs.forEach((song) => {
    song.slug = slugify(song.text);
  });

  saveJSON(songsFile, songs);
}

// Loop again, extracting data for each song
for (const [slug, name, url] of lyricists) {
  const songsFile = getAuthorFile(slug);
  if (!fs.existsSync(songsFile)) {
    throw new Error(`Songs file is missing for: ${name}`);
  }

  const songs = readJSON(songsFile);
  for (const song of songs) {
    const songFile = getSongFile(song.slug);
    if (fs.existsSync(songFile)) {
      continue;
    }

    console.log(`Extracting song info for ${song.text}`);

    await page.goto(url);

    await page.evaluate((song) => {
      const links = Array.from(document.querySelectorAll('td b a')) as HTMLAnchorElement[];
      const elem = links.find((link) => link.href === song.url);

      elem?.click();
    }, song);

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    for (const frame of page.frames()) {
      const frameUrl = frame.url();
      if (!frameUrl.startsWith('https://whitegum.com/~acsa/songfile/')) {
        continue;
      }

      const content = await frame.content();
      const data = getLyricsFromContent(content);
      saveJSON(songFile, { ...data, slug: song.slug, url: song.url });
    }
  }
}

for (const [slug] of lyricists) {
  const dir = path.join(baseDir, 'responses');
  const authorFile = path.join(dir, `${slug}.json`);
  const songs = readJSON(authorFile);

  for (const song of songs) {
    const songFile = path.join(dir, 'lyrics', `${song.slug}.json`);
    if (!fs.existsSync(songFile)) {
      continue;
    }
    const data = readJSON(songFile);
    if (!data.lyrics) {
      continue;
    }

    // Create docx file in case we need to edit later and generate new PDF
    await createDocxFile(baseDir, data);
    await jsonToPdf(browser, baseDir, data);
  }
}

await browser.close();

process.exit(0);
