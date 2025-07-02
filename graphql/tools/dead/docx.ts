import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import fs from 'node:fs';

interface Song {
  title: string;
  authors: string[];
  lyrics: string;
  slug: string;
}

function createParagraph(text: string, opts = {}, textOpts = {}) {
  const styles = { font: 'Helvetica Neue Light', color: '#000000' };
  return new Paragraph({
    ...opts,
    children: [new TextRun({ ...styles, ...textOpts, text })],
  });
}

export async function createDocxFile(baseDir: string, song: Song) {
  const filename = `${baseDir}/docx/${song.slug}.docx`;
  if (fs.existsSync(filename)) {
    return filename;
  }

  const document = new Document({
    revision: 1,
    sections: [
      {
        properties: {
          // This sets the page to Letter instead of A4 when opening in Pages
          page: {
            size: {
              orientation: 'portrait',
              width: 12240, // 8.5 inches × 1440 = 12240 twips
              height: 15840, // 11 inches × 1440 = 15840 twips
            },
          },
        },
        children: [
          createParagraph(
            song.title,
            {
              heading: HeadingLevel.TITLE,
            },
            {
              size: 36,
              bold: true,
            }
          ),
          ...song.authors.map((text) => createParagraph(text, { heading: HeadingLevel.HEADING_3 })),
        ],
      },
      {
        properties: {
          type: 'continuous',
          column: {
            count: 2,
            equalWidth: true,
          },
        },
        children: [
          ...song.lyrics.split('\n').map((line) => {
            const trimmed = line.trim();
            let text = trimmed;
            if (['[chorus]', '[chorus - repeated]'].includes(text)) {
              text = text.replace(/[\[\]]/g, '').replace('chorus', 'Chorus');
            }
            return createParagraph(
              text,
              {},
              { size: 24, bold: text === 'Chorus' || text === 'Chorus - repeated' }
            );
          }),
        ],
      },
    ],
  });

  try {
    const buffer = await Packer.toBuffer(document);
    fs.writeFileSync(filename, buffer);
    console.log(`${song.slug}.docx created successfully!`);
    return filename;
  } catch (error) {
    console.error('Error creating document:', error);
  }
}
