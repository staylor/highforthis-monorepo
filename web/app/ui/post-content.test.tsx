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
});
