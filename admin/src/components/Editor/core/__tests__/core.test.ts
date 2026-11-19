// The editor without React: what any UI framework hosting it gets.
import { $isListNode } from '@lexical/list';
import { $isHeadingNode } from '@lexical/rich-text';
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import type { LexicalEditor, ParagraphNode } from 'lexical';
import { describe, expect, it, onTestFinished } from 'vitest';

import { image, savedImage, savedPost, savedVideo, video } from '../../__tests__/fixtures';
import { $createVideoNode } from '../VideoNode';
import { createBlockToolbar } from '../blockToolbar';
import { createPostEditor } from '../editor';
import { createInlineToolbar, positionInlineToolbar } from '../inlineToolbar';

function mountEditor(editorState?: typeof savedPost) {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  const field = document.createElement('input');
  document.body.append(root, field);

  const postEditor = createPostEditor({ theme: {}, editorState });
  const unmount = postEditor.mount(root, field);
  onTestFinished(() => {
    unmount();
    root.remove();
    field.remove();
  });
  return { ...postEditor, root, field, unmount, saved: () => JSON.parse(field.value) };
}

const update = (editor: LexicalEditor, fn: () => void) => editor.update(fn, { discrete: true });

// commands, and the toolbars' changes, commit on a microtask
const flush = () => new Promise((resolve) => setTimeout(resolve));

const typeText = (editor: LexicalEditor, value: string) =>
  update(editor, () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      selection.insertText(value);
    }
  });

const textOf = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => $getRoot().getTextContent());

const blockTypes = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => ($isHeadingNode(node) ? node.getTag() : node.getType()))
  );

describe('post editor', () => {
  it('loads a saved post and fills the field with the JSON the save reads', () => {
    const { root, saved } = mountEditor(savedPost);

    expect(root.querySelector('h3')?.textContent).toBe('Best albums');
    expect(root.querySelector('img')?.getAttribute('src')).toBe(
      `https://storage.googleapis.com/wonderboymusic/${image.destination}/album-640x0.jpg`
    );
    expect(root.querySelector(`img[alt="${video.title}"]`)).not.toBeNull();

    const blocks = saved().root.children;
    expect(blocks.map((node: { type: string }) => node.type)).toEqual([
      'heading',
      'image',
      'paragraph',
      'video',
      'list',
    ]);
    expect(blocks[1]).toEqual(savedImage);
    expect(blocks[3]).toEqual(savedVideo);
  });

  it('starts a new post with an empty paragraph and shows the placeholder until there is text', () => {
    const { editor, placeholder } = mountEditor();
    expect(blockTypes(editor)).toEqual(['paragraph']);
    expect(placeholder.get()).toBeTruthy();

    update(editor, () => $getRoot().selectStart());
    typeText(editor, 'Hello');

    expect(placeholder.get()).toBe(false);
  });

  it('undoes and redoes edits', async () => {
    const { editor, saved } = mountEditor();
    update(editor, () => $getRoot().selectStart());
    typeText(editor, 'Hello');

    editor.dispatchCommand(UNDO_COMMAND, undefined);
    await flush();
    expect(textOf(editor)).toBe('');
    expect(saved().root.children[0].children).toEqual([]);

    editor.dispatchCommand(REDO_COMMAND, undefined);
    await flush();
    expect(textOf(editor)).toBe('Hello');
  });

  it('lets go of the element and the field when unmounted', () => {
    const { editor, field, unmount } = mountEditor();
    const before = field.value;

    unmount();
    update(editor, () => {
      ($getRoot().getFirstChildOrThrow() as ParagraphNode).append($createTextNode('Later'));
    });

    expect(editor.getRootElement()).toBeNull();
    expect(field.value).toBe(before);
  });

  it('plays a video in place when its thumbnail is clicked', () => {
    const { editor } = mountEditor();
    // the video's DOM, outside the page, so the test doesn't load the player
    let dom: HTMLElement = document.createElement('div');
    update(editor, () => {
      dom = $createVideoNode(video).createDOM();
    });
    const thumbnail = dom.querySelector(`a:has(img[alt="${video.title}"])`) as HTMLElement;
    expect(thumbnail).toHaveAttribute('href', `/video/${video.slug}`);

    thumbnail.click();

    expect(thumbnail.querySelector('iframe')?.getAttribute('src')).toBe(
      `https://www.youtube.com/embed/${video.dataId}?autoplay=1`
    );
  });
});

describe('block toolbar', () => {
  function setup(editorState?: typeof savedPost) {
    const mounted = mountEditor(editorState);
    const toolbar = createBlockToolbar(mounted.editor);
    onTestFinished(toolbar.register());
    return { ...mounted, toolbar };
  }

  it('shows at the start of a line, with the line’s block type', () => {
    const { editor, toolbar } = setup(savedPost);

    update(editor, () => ($getRoot().getFirstChildOrThrow() as ParagraphNode).selectStart());
    expect(toolbar.get()).toMatchObject({ visible: true, open: true, style: 'h3' });

    update(editor, () => {
      const text = ($getRoot().getFirstChildOrThrow() as ParagraphNode).getFirstChild();
      if ($isTextNode(text)) {
        text.select(2, 2);
      }
    });
    expect(toolbar.get()).toMatchObject({ visible: false, open: false });
  });

  it('opens and closes on the button at the start of a paragraph', () => {
    const { editor, toolbar } = setup();
    update(editor, () => $getRoot().selectStart());
    expect(toolbar.get()).toMatchObject({ visible: true, open: false, style: '' });

    toolbar.toggleOpen();
    expect(toolbar.get().open).toBeTruthy();
    toolbar.toggleOpen();
    expect(toolbar.get().open).toBe(false);
  });

  it('changes the line’s block type, and back to a paragraph', async () => {
    const { editor, toolbar } = setup();
    update(editor, () => $getRoot().selectStart());

    toolbar.choose('h2');
    await flush();
    expect(blockTypes(editor)).toEqual(['h2']);
    expect(toolbar.get().style).toBe('h2');
    toolbar.choose('h2');
    await flush();
    expect(blockTypes(editor)).toEqual(['paragraph']);

    toolbar.choose('number');
    await flush();
    expect(
      editor.getEditorState().read(() => {
        const list = $getRoot().getFirstChild();
        return $isListNode(list) ? list.getListType() : null;
      })
    ).toBe('number');
  });

  it('inserts the image picked for an empty line, with a new line after it', async () => {
    const { editor, toolbar, saved } = setup();
    update(editor, () => $getRoot().selectStart());

    toolbar.choose('atomic-image');
    expect(toolbar.get().picker).toBe('media');
    toolbar.insertImage(image, 'FEATURE');
    toolbar.closePicker();
    await flush();

    expect(toolbar.get().picker).toBeNull();
    expect(saved().root.children[0]).toEqual(savedImage);
    expect(blockTypes(editor)).toEqual(['image', 'paragraph']);
  });

  it('inserts the video picked above a line with text', async () => {
    const { editor, toolbar, saved } = setup();
    update(editor, () => {
      const line = $getRoot().getFirstChildOrThrow() as ParagraphNode;
      line.append($createTextNode('Watch this'));
      line.selectStart();
    });

    toolbar.choose('video');
    expect(toolbar.get().picker).toBe('video');
    toolbar.insertVideo(video);
    await flush();

    expect(saved().root.children[0]).toEqual(savedVideo);
    expect(
      editor.getEditorState().read(() => {
        const line = $getRoot().getLastChild();
        return $isElementNode(line) ? line.getTextContent() : null;
      })
    ).toBe('Watch this');
  });
});

describe('inline toolbar', () => {
  it('shows over selected text, formats it, and hides when the selection collapses', async () => {
    const { editor, root, saved } = mountEditor(savedPost);
    const toolbar = createInlineToolbar(editor);
    onTestFinished(toolbar.register(document.createElement('div')));
    // "Key tracks:", in bold
    const bold = root.querySelector('p strong')?.firstChild as Text;

    // select "Key", in the page and in the editor
    window.getSelection()?.setBaseAndExtent(bold, 0, bold, 3);
    update(editor, () => {
      const text = ($getRoot().getChildAtIndex(2) as ParagraphNode | null)?.getFirstChild();
      if ($isTextNode(text)) {
        text.select(0, 3);
      }
    });
    expect(toolbar.get()).toMatchObject({ visible: true, formats: { italic: false } });

    toolbar.toggleFormat('italic');
    await flush();
    expect(toolbar.get().formats).toMatchObject({ bold: true, italic: true });
    expect(saved().root.children[2].children[0]).toMatchObject({ text: 'Key', format: 3 });

    update(editor, () => $getRoot().selectStart());
    expect(toolbar.get().visible).toBe(false);
  });

  const rect = (left: number, top: number, width: number) =>
    ({ left, top, width, height: 20 }) as DOMRect;

  it('centers above a selection narrower than itself', () => {
    expect(positionInlineToolbar(rect(300, 200, 40), rect(100, 100, 600), 100)).toEqual({
      left: 170,
      top: 58,
      flush: false,
    });
  });

  it('stays inside the editor’s left edge', () => {
    expect(positionInlineToolbar(rect(110, 200, 20), rect(100, 100, 600), 100)).toEqual({
      left: 0,
      top: 58,
      flush: true,
    });
  });
});
