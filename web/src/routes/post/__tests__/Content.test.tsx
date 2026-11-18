import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ListType } from '#/types/graphql';
import type { EditorState } from '#/types/graphql';

import Content from '../Content';

const text = (value: string, format = 0) => ({
  __typename: 'TextNode',
  format,
  text: value,
  type: 'text',
});
const block = (type: string, children: object[], fields: object = {}) => ({
  children,
  type,
  ...fields,
});

function renderContent(...blocks: object[]) {
  const editorState = { root: { children: blocks } } as EditorState;
  return render(<Content editorState={editorState} />);
}

describe('post content', () => {
  it('numbers a list from where it starts', () => {
    renderContent(
      block('list', [block('listitem', [text('Third')]), block('listitem', [text('Fourth')])], {
        listType: ListType.Number,
        start: 3,
      })
    );

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('start', '3');
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Third',
      'Fourth',
    ]);
  });

  it('bullets a list, keeping its formatting and leaving out empty items', () => {
    renderContent(
      block(
        'list',
        [block('listitem', [text('Plain and '), text('bold', 1)]), block('listitem', [text(' ')])],
        { listType: ListType.Bullet, start: 1 }
      )
    );

    expect(screen.getByRole('list').tagName).toBe('UL');
    expect(screen.getByRole('listitem')).toHaveTextContent('Plain and bold');
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });
});
