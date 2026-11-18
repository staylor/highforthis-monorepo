import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { $getRoot, getNearestEditorFromDOMNode, type LexicalEditor } from 'lexical';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';

import Editor from '#/components/Editor';

import { savedImage, savedPost, savedVideo } from './fixtures';

async function renderEditor(editorState?: typeof savedPost) {
  const Stub = createRoutesStub([
    { path: '/', Component: () => <Editor editorState={editorState} /> },
  ]);
  const { container } = render(<Stub />);
  const textbox = await screen.findByRole('textbox');
  const field = container.querySelector('input[name="editorState"]') as HTMLInputElement;
  return {
    editor: getNearestEditorFromDOMNode(textbox) as LexicalEditor,
    textbox,
    saved: () => JSON.parse(field.value),
  };
}

async function update(editor: LexicalEditor, fn: () => void) {
  await act(async () => {
    editor.update(fn, { discrete: true });
  });
}

// the inline toolbar's buttons, in order: bold, italic, underline, strikethrough, superscript,
// subscript, code; the superscript and subscript buttons are the ones labeled with an X
const inlineButton = (index: number) =>
  screen.getAllByText('X')[0].parentElement?.children[index] as Element;
const BOLD = 0;

describe('editor', () => {
  it('shows a saved post and saves it back in the same format', async () => {
    const { textbox, saved } = await renderEditor(savedPost);

    expect(textbox.querySelector('h3')).toHaveTextContent('Best albums');
    expect(textbox.querySelector('ul')).toHaveTextContent('One');
    const blocks = saved().root.children;
    expect(blocks[1]).toEqual(savedImage);
    expect(blocks[3]).toEqual(savedVideo);
  });

  it('shows the placeholder only while the post is empty', async () => {
    const { editor, textbox } = await renderEditor();
    const placeholder = () => textbox.parentElement?.querySelector('.editor-placeholder');
    expect(placeholder()).not.toBeNull();

    await update(editor, () => {
      $getRoot().selectStart().insertText('Hello');
    });

    expect(placeholder()).toBeNull();
  });

  it('formats the selected text from the inline toolbar', async () => {
    const { textbox, saved } = await renderEditor(savedPost);
    // select "all" in "Key tracks: all of them" the way the browser does
    const plain = textbox.querySelector('p')?.lastChild?.firstChild as Text;
    await act(async () => {
      window.getSelection()?.setBaseAndExtent(plain, 1, plain, 4);
    });

    expect(inlineButton(BOLD)).not.toHaveClass('text-dark');
    fireEvent.mouseDown(inlineButton(BOLD));

    await waitFor(() =>
      expect(saved().root.children[2].children).toContainEqual(
        expect.objectContaining({ text: 'all', format: 1 })
      )
    );
    expect(inlineButton(BOLD)).toHaveClass('text-dark');
  });
});
