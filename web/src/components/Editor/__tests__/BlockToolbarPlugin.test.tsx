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
import { createRoutesStub } from 'react-router';
import { describe, expect, it, onTestFinished } from 'vitest';

import Editor from '#/components/Editor';

// the block toolbar's buttons, in order: H2, H3, image, video, quote, bullet list, numbered list, code
const VIDEO = 3;
const BULLET_LIST = 5;

const video = {
  id: 'video-1',
  dataId: 'youtube-1',
  slug: 'a-video',
  title: 'A video',
  thumbnails: [{ height: 90, url: 'https://example.com/thumbnail.jpg', width: 120 }],
};

async function renderEditor() {
  const Stub = createRoutesStub([
    { path: '/', Component: () => <Editor /> },
    // what the video picker lists
    {
      path: '/modals/video/:cursor?',
      loader: () => ({ videos: { edges: [{ node: video }], pageInfo: { hasNextPage: false } } }),
    },
  ]);
  render(<Stub />);
  return getNearestEditorFromDOMNode(await screen.findByRole('textbox')) as LexicalEditor;
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
    const editor = await renderEditor();
    await update(editor, () => $getRoot().selectStart());

    fireEvent.mouseDown(screen.getByText('H3'));

    await waitFor(() => expect(blocks(editor)).toEqual([{ type: 'h3', text: '' }]));
  });

  it('keeps taking input after changing an empty line', async () => {
    const editor = await renderEditor();
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
    const editor = await renderEditor();
    await update(editor, () => $getRoot().selectStart());

    fireEvent.mouseDown(screen.getByText('H3'));
    await waitFor(() => expect(blocks(editor)).toEqual([{ type: 'h3', text: '' }]));
    fireEvent.mouseDown(screen.getByText('H3'));

    await waitFor(() => expect(blocks(editor)).toEqual([{ type: 'paragraph', text: '' }]));
  });

  it('makes a line with mixed formatting a single list item', async () => {
    const editor = await renderEditor();
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

  it('saves the video picked from the toolbar by its id', async () => {
    const portal = document.createElement('div');
    portal.id = 'portal';
    document.body.append(portal);
    onTestFinished(() => portal.remove());
    const editor = await renderEditor();
    await update(editor, () => $getRoot().selectStart());

    fireEvent.mouseDown(blockButton(VIDEO));
    fireEvent.click(await screen.findByText(video.title));

    await waitFor(() =>
      expect(editor.getEditorState().toJSON().root.children[0]).toEqual({
        type: 'video',
        version: 1,
        videoId: video.id,
      })
    );
  });
});
