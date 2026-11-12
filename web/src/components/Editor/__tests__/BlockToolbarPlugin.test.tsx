import { $isListNode } from '@lexical/list';
import { $isHeadingNode } from '@lexical/rich-text';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  getNearestEditorFromDOMNode,
  type LexicalEditor,
  type ParagraphNode,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import Editor from '#/components/Editor';

// the block toolbar's buttons, in order: H2, H3, image, video, quote, bullet list, numbered list, code
const BULLET_LIST = 5;

function renderEditor() {
  const { container } = render(<Editor />);
  return getNearestEditorFromDOMNode(
    container.querySelector('[data-lexical-editor="true"]')
  ) as LexicalEditor;
}

async function update(editor: LexicalEditor, fn: () => void) {
  await act(async () => {
    editor.update(fn, { discrete: true });
  });
}

const blockButton = (index: number) =>
  screen.getByText('H3').parentElement?.children[index] as Element;

function blocks(editor: LexicalEditor) {
  return editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((block) => ({
        type: $isHeadingNode(block) ? block.getTag() : block.getType(),
        text: block.getTextContent(),
      }))
  );
}

describe('block toolbar', () => {
  it('turns the empty first line of a new post into a heading', async () => {
    const editor = renderEditor();
    await update(editor, () => $getRoot().selectStart());

    fireEvent.mouseDown(screen.getByText('H3'));

    await waitFor(() => expect(blocks(editor)).toEqual([{ type: 'h3', text: '' }]));
  });

  it('keeps taking input after changing an empty line', async () => {
    const editor = renderEditor();
    await update(editor, () => {
      const empty = $createParagraphNode();
      $getRoot().getFirstChildOrThrow<ParagraphNode>().append($createTextNode('First line'));
      $getRoot().append(empty);
      empty.select();
    });

    fireEvent.mouseDown(screen.getByText('H2'));
    await update(editor, () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText('Next');
      }
    });

    expect(blocks(editor)).toEqual([
      { type: 'paragraph', text: 'First line' },
      { type: 'h2', text: 'Next' },
    ]);
  });

  it('turns a line back into a paragraph when its own type is pressed again', async () => {
    const editor = renderEditor();
    await update(editor, () => $getRoot().selectStart());

    fireEvent.mouseDown(screen.getByText('H3'));
    await waitFor(() => expect(blocks(editor)).toEqual([{ type: 'h3', text: '' }]));
    fireEvent.mouseDown(screen.getByText('H3'));

    await waitFor(() => expect(blocks(editor)).toEqual([{ type: 'paragraph', text: '' }]));
  });

  it('makes a line with mixed formatting a single list item', async () => {
    const editor = renderEditor();
    await update(editor, () => {
      const line = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      line.append($createTextNode('Bold').toggleFormat('bold'), $createTextNode(' and plain'));
      line.selectStart();
    });

    fireEvent.mouseDown(blockButton(BULLET_LIST));

    await waitFor(() =>
      expect(
        editor.getEditorState().read(() => {
          const list = $getRoot().getFirstChild();
          return $isListNode(list) ? list.getChildren().map((item) => item.getTextContent()) : [];
        })
      ).toEqual(['Bold and plain'])
    );
  });
});
