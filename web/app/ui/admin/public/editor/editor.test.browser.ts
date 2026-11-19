// The post editor without a UI framework: what the client entry hosting it gets. Moved from the
// admin app, where it ran on happy-dom; it runs in a browser now (`pnpm test:browser`).
import './browser-env.ts';
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
import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import { createBlockToolbar } from './block-toolbar.ts';
import { createPostEditor } from './editor.ts';
import { image, savedImage, savedPost, savedVideo, video } from './fixtures.ts';
import { createInlineToolbar, positionInlineToolbar } from './inline-toolbar.ts';
import { $createVideoNode } from './video-node.ts';

/** The fields of `value` that `expected` names, to compare the way toMatchObject did. */
function pick<T extends object>(value: T, expected: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.keys(expected).map((key) => [key, value[key as keyof T]])
  ) as Partial<T>;
}

function mountEditor(t: TestContext, editorState?: typeof savedPost) {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  const field = document.createElement('input');
  document.body.append(root, field);

  const postEditor = createPostEditor({ theme: {}, editorState });
  const unmount = postEditor.mount(root, field);
  t.after(() => {
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
  it('loads a saved post and fills the field with the JSON the save reads', (t) => {
    const { root, saved } = mountEditor(t, savedPost);

    assert.equal(root.querySelector('h3')?.textContent, 'Best albums');
    assert.equal(
      root.querySelector('img')?.getAttribute('src'),
      `https://storage.googleapis.com/wonderboymusic/${image.destination}/album-640x0.jpg`
    );
    assert.notEqual(root.querySelector(`img[alt="${video.title}"]`), null);

    const blocks = saved().root.children;
    assert.deepEqual(
      blocks.map((node: { type: string }) => node.type),
      ['heading', 'image', 'paragraph', 'video', 'list']
    );
    assert.deepEqual(blocks[1], savedImage);
    assert.deepEqual(blocks[3], savedVideo);
  });

  it('starts a new post with an empty paragraph and shows the placeholder until there is text', (t) => {
    const { editor, placeholder } = mountEditor(t);
    assert.deepEqual(blockTypes(editor), ['paragraph']);
    assert.ok(placeholder.get());

    update(editor, () => $getRoot().selectStart());
    typeText(editor, 'Hello');

    assert.equal(placeholder.get(), false);
  });

  it('undoes and redoes edits', async (t) => {
    const { editor, saved } = mountEditor(t);
    update(editor, () => $getRoot().selectStart());
    typeText(editor, 'Hello');

    editor.dispatchCommand(UNDO_COMMAND, undefined);
    await flush();
    assert.equal(textOf(editor), '');
    assert.deepEqual(saved().root.children[0].children, []);

    editor.dispatchCommand(REDO_COMMAND, undefined);
    await flush();
    assert.equal(textOf(editor), 'Hello');
  });

  it('lets go of the element and the field when unmounted', (t) => {
    const { editor, field, unmount } = mountEditor(t);
    const before = field.value;

    unmount();
    update(editor, () => {
      ($getRoot().getFirstChildOrThrow() as ParagraphNode).append($createTextNode('Later'));
    });

    assert.equal(editor.getRootElement(), null);
    assert.equal(field.value, before);
  });

  it('plays a video in place when its thumbnail is clicked', (t) => {
    const { editor } = mountEditor(t);
    // the video's DOM, outside the page, so the test doesn't load the player
    let dom: HTMLElement = document.createElement('div');
    update(editor, () => {
      dom = $createVideoNode(video).createDOM();
    });
    const thumbnail = dom.querySelector(`a:has(img[alt="${video.title}"])`) as HTMLElement;
    assert.equal(thumbnail.getAttribute('href'), `/video/${video.slug}`);

    thumbnail.click();

    assert.equal(
      thumbnail.querySelector('iframe')?.getAttribute('src'),
      `https://www.youtube.com/embed/${video.dataId}?autoplay=1`
    );
  });
});

describe('block toolbar', () => {
  function setup(t: TestContext, editorState?: typeof savedPost) {
    const mounted = mountEditor(t, editorState);
    const toolbar = createBlockToolbar(mounted.editor);
    t.after(toolbar.register());
    return { ...mounted, toolbar };
  }

  it('shows at the start of a line, with the line’s block type', (t) => {
    const { editor, toolbar } = setup(t, savedPost);

    update(editor, () => ($getRoot().getFirstChildOrThrow() as ParagraphNode).selectStart());
    assert.deepEqual(pick(toolbar.get(), { visible: true, open: true, style: 'h3' }), {
      visible: true,
      open: true,
      style: 'h3',
    });

    update(editor, () => {
      const text = ($getRoot().getFirstChildOrThrow() as ParagraphNode).getFirstChild();
      if ($isTextNode(text)) {
        text.select(2, 2);
      }
    });
    assert.deepEqual(pick(toolbar.get(), { visible: false, open: false }), {
      visible: false,
      open: false,
    });
  });

  it('opens and closes on the button at the start of a paragraph', (t) => {
    const { editor, toolbar } = setup(t);
    update(editor, () => $getRoot().selectStart());
    assert.deepEqual(pick(toolbar.get(), { visible: true, open: false, style: '' }), {
      visible: true,
      open: false,
      style: '',
    });

    toolbar.toggleOpen();
    assert.ok(toolbar.get().open);
    toolbar.toggleOpen();
    assert.equal(toolbar.get().open, false);
  });

  it('changes the line’s block type, and back to a paragraph', async (t) => {
    const { editor, toolbar } = setup(t);
    update(editor, () => $getRoot().selectStart());

    toolbar.choose('h2');
    await flush();
    assert.deepEqual(blockTypes(editor), ['h2']);
    assert.equal(toolbar.get().style, 'h2');
    toolbar.choose('h2');
    await flush();
    assert.deepEqual(blockTypes(editor), ['paragraph']);

    toolbar.choose('number');
    await flush();
    assert.equal(
      editor.getEditorState().read(() => {
        const list = $getRoot().getFirstChild();
        return $isListNode(list) ? list.getListType() : null;
      }),
      'number'
    );
  });

  it('inserts the image picked for an empty line, with a new line after it', async (t) => {
    const { editor, toolbar, saved } = setup(t);
    update(editor, () => $getRoot().selectStart());

    toolbar.choose('atomic-image');
    assert.equal(toolbar.get().picker, 'media');
    toolbar.insertImage(image, 'FEATURE');
    toolbar.closePicker();
    await flush();

    assert.equal(toolbar.get().picker, null);
    assert.deepEqual(saved().root.children[0], savedImage);
    assert.deepEqual(blockTypes(editor), ['image', 'paragraph']);
  });

  it('inserts the video picked above a line with text', async (t) => {
    const { editor, toolbar, saved } = setup(t);
    update(editor, () => {
      const line = $getRoot().getFirstChildOrThrow() as ParagraphNode;
      line.append($createTextNode('Watch this'));
      line.selectStart();
    });

    toolbar.choose('video');
    assert.equal(toolbar.get().picker, 'video');
    toolbar.insertVideo(video);
    await flush();

    assert.deepEqual(saved().root.children[0], savedVideo);
    assert.equal(
      editor.getEditorState().read(() => {
        const line = $getRoot().getLastChild();
        return $isElementNode(line) ? line.getTextContent() : null;
      }),
      'Watch this'
    );
  });
});

describe('inline toolbar', () => {
  it('shows over selected text, formats it, and hides when the selection collapses', async (t) => {
    const { editor, root, saved } = mountEditor(t, savedPost);
    const toolbar = createInlineToolbar(editor);
    t.after(toolbar.register(document.createElement('div')));
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
    assert.equal(toolbar.get().visible, true);
    assert.equal(toolbar.get().formats.italic, false);

    toolbar.toggleFormat('italic');
    await flush();
    assert.deepEqual(pick(toolbar.get().formats, { bold: true, italic: true }), {
      bold: true,
      italic: true,
    });
    assert.deepEqual(pick(saved().root.children[2].children[0], { text: 'Key', format: 3 }), {
      text: 'Key',
      format: 3,
    });

    update(editor, () => $getRoot().selectStart());
    assert.equal(toolbar.get().visible, false);
  });

  const rect = (left: number, top: number, width: number) =>
    ({ left, top, width, height: 20 }) as DOMRect;

  it('centers above a selection narrower than itself', () => {
    assert.deepEqual(positionInlineToolbar(rect(300, 200, 40), rect(100, 100, 600), 100), {
      left: 170,
      top: 58,
      flush: false,
    });
  });

  it('stays inside the editor’s left edge', () => {
    assert.deepEqual(positionInlineToolbar(rect(110, 200, 20), rect(100, 100, 600), 100), {
      left: 0,
      top: 58,
      flush: true,
    });
  });
});
