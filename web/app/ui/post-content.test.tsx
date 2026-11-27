import * as assert from 'remix/assert';
import { renderToString } from 'remix/component/server';
import { describe, it } from 'remix/test';

import { ListType, type EditorState } from '#/types/graphql.ts';

import { PostContent } from './post-content.tsx';

const text = (value: string, format = 0) => ({
  format,
  text: value,
  type: 'text',
});
const block = (type: string, children: object[], fields: object = {}) => ({
  children,
  type,
  ...fields,
});

const render = (...blocks: object[]) =>
  renderToString(<PostContent editorState={{ root: { children: blocks } } as EditorState} />);

describe('PostContent', () => {
  it('shows every format the editor can give text', async () => {
    const html = await render(
      block('paragraph', [
        text('bold', 1),
        text('italic', 2),
        text('struck', 4),
        text('underlined', 8),
        text('code', 16),
        text('sub', 32),
        text('super', 64),
        text('plain'),
      ])
    );
    assert.match(
      html,
      /<strong>bold<\/strong><em>italic<\/em><s>struck<\/s><u>underlined<\/u><code>code<\/code><sub>sub<\/sub><sup>super<\/sup>plain/
    );
  });

  it('nests the formats of text that has several', async () => {
    const html = await render(
      block('paragraph', [
        text('bold code', 1 | 16),
        text('everything', 1 | 2 | 8),
        text('struck bold', 1 | 4),
      ])
    );
    assert.match(html, /<strong><code>bold code<\/code><\/strong>/);
    assert.match(html, /<strong><em><u>everything<\/u><\/em><\/strong>/);
    assert.match(html, /<strong><s>struck bold<\/s><\/strong>/);
  });

  it('numbers a list from where it starts', async () => {
    const html = await render(
      block('list', [block('listitem', [text('Third')]), block('listitem', [text('Fourth')])], {
        listType: ListType.Number,
        start: 3,
      })
    );
    assert.match(html, /<ol[^>]* start="3"/);
    assert.deepEqual(
      [...html.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map(([, item]) => item.replace(/<[^>]+>/g, '')),
      ['Third', 'Fourth']
    );
  });

  it('bullets a list, keeping its formatting and leaving out empty items', async () => {
    const html = await render(
      block(
        'list',
        [block('listitem', [text('Plain and '), text('bold', 1)]), block('listitem', [text(' ')])],
        { listType: ListType.Bullet, start: 1 }
      )
    );
    assert.match(html, /<ul/);
    assert.equal([...html.matchAll(/<li/g)].length, 1);
    assert.match(html, /Plain and <strong[^>]*>bold<\/strong>/);
  });

  it('gives images their sizes and descriptions, and loads all but the first as they near the screen', async () => {
    const image = (id: string, altText: string | null) => ({
      type: 'image',
      image: {
        id,
        altText,
        destination: '2024/05',
        crops: [
          { fileName: `${id}-300.jpg`, width: 300, height: 200 },
          { fileName: `${id}-640.jpg`, width: 640, height: 427 },
        ],
      },
    });

    const html = await render(
      block('paragraph', [text('Intro')]),
      { type: 'image', image: null },
      image('first', 'The band on stage'),
      image('second', null)
    );

    const images = html.match(/<img [^>]*>/g) ?? [];
    assert.equal(images.length, 2);
    const [first = '', second = ''] = images;
    assert.match(first, /src="[^"]*\/2024\/05\/first-640\.jpg"/);
    assert.match(first, /alt="The band on stage"/);
    assert.match(first, /width="640"/);
    assert.match(first, /height="427"/);
    assert.match(first, /decoding="async"/);
    assert.doesNotMatch(first, /loading=/);
    assert.match(second, /alt=""/);
    assert.match(second, /loading="lazy"/);
  });

  it('leaves out an image or a video that is gone', async () => {
    const html = await render(
      { type: 'image', image: null },
      { type: 'video', video: null },
      block('paragraph', [text('Still here')])
    );
    assert.match(html.replace(/<head>.*<\/head>/s, ''), /^<p[^>]*>Still here<\/p>$/);
  });
});
