import type { Browser } from 'puppeteer';
import fs from 'node:fs';

interface Song {
  title: string;
  authors: string[];
  lyrics: string;
  slug: string;
}

export async function jsonToPdf(browser: Browser, baseDir: string, song: Song) {
  const filename = `${baseDir}/pdf/${song.slug}.pdf`;
  if (fs.existsSync(filename)) {
    return filename;
  }

  console.log('Creating PDF for:', song.title);

  const page = await browser.newPage();
  const lines = song.lyrics.split('\n');

  const styledHtml = `
    <html>
    <head>
      <style>
        body { font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', sans-serif; margin: 0; padding: 0; }
        h1 { font-size: 18pt; line-height: 18pt; font-weight: bold; margin: 0; padding: 0; }
        h2 { font-size: 12pt; line-height: 1.2; font-weight: normal; margin: 0; padding: 0; }
        h3 { font-size: 11pt; line-height: 1.2; font-weight: normal; margin: 0; padding: 0; }
        h3:last-of-type { margin-bottom: 12pt; }
        p { font-size: ${lines.length > 75 ? '10.5pt' : '12pt'}; line-height: 1.2; margin: 0; padding: 0; }
        .break { margin-bottom: 12pt; }
        .chorus { margin: 12pt 0; }
        ${lines.length > 40 ? `.columns { column-count: 2; column-gap: 40px; }` : ''}
        strong { font-weight: bold; }
        em { font-style: italic; }
      </style>
    </head>
    <body>
      <h1>${song.title}</h1>
      ${song.authors.map((text) => `<h3>${text}</h3>`).join('')}
      <div class="columns">
      ${lines
        .map((line) => {
          const trimmed = line.trim();
          let text = trimmed;
          if (text === '') {
            return `<p class="break"></p>`;
          }

          if (text === 'Chorus') {
            return `<p><strong>${text}</strong></p>`;
          }

          if (['[chorus]', '[chorus - repeated]'].includes(text)) {
            text = text.replace(/[\[\]]/g, '').replace('chorus', 'Chorus');
            return `<p class="chorus"><strong>${text}</strong></p>`;
          }

          return `<p>${text}</p>`;
        })
        .join('')}
      </div>  
    </body>
    </html>
  `;

  await page.setContent(styledHtml);
  await page.pdf({
    path: filename,
    format: 'letter',
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
  });
}
