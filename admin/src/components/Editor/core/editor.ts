import { CodeNode } from '@lexical/code';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { ListItemNode, ListNode, registerList } from '@lexical/list';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  createEditor,
  HISTORY_MERGE_TAG,
} from 'lexical';
import type {
  EditorState,
  EditorThemeClasses,
  LexicalEditor,
  SerializedEditorState,
} from 'lexical';

import ImageNode from './ImageNode';
import VideoNode from './VideoNode';
import { createStore } from './store';

// typing that pauses for longer than this starts a new undo step
const HISTORY_DELAY = 1000;

/** The editor shows its placeholder while the post is a single empty paragraph. */
function $canShowPlaceholder(editor: LexicalEditor) {
  const root = $getRoot();
  if (editor.isComposing() || root.getTextContent() !== '') {
    return false;
  }
  const blocks = root.getChildren();
  if (blocks.length > 1) {
    return false;
  }
  const [block] = blocks;
  return (
    !block ||
    ($isParagraphNode(block) &&
      block.getIndent() === 0 &&
      block.getChildren().every((child) => $isTextNode(child)))
  );
}

interface PostEditorOptions {
  theme: EditorThemeClasses;
  // the post's saved body, as GraphQL sends it: images and videos carry their data, not their ids
  editorState?: SerializedEditorState | null;
}

/**
 * The post editor, on Lexical alone: rich text, lists and undo history bound to a contenteditable
 * element. Nothing here depends on React, so another UI framework can host the same editor; the
 * host renders the element, the form field and the placeholder, and calls `mount()`.
 */
export function createPostEditor({ theme, editorState }: PostEditorOptions) {
  const editor: LexicalEditor = createEditor({
    namespace: 'HighForThis',
    theme,
    nodes: [HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, ImageNode, VideoNode],
    onError(error: Error) {
      // Throw while the saved post loads, so a partly parsed post can't be saved over it. After
      // that, returning lets Lexical drop the failed update and restore the last good state;
      // throwing would leave the update pending, and the editor would stop taking input.
      if (editor.getEditorState().isEmpty()) {
        throw error;
      }
      console.error(error);
    },
  });

  if (editorState?.root?.children?.length) {
    editor.setEditorState(editor.parseEditorState(editorState), { tag: HISTORY_MERGE_TAG });
  } else {
    // without a saved body, the post starts with an empty paragraph to write in
    editor.update(
      () => {
        const root = $getRoot();
        if (root.isEmpty()) {
          root.append($createParagraphNode());
        }
      },
      { tag: HISTORY_MERGE_TAG }
    );
  }

  const placeholder = createStore(editor.getEditorState().read(() => $canShowPlaceholder(editor)));

  return {
    editor,
    /** Whether to show the placeholder over the empty editor. */
    placeholder: { get: placeholder.get, subscribe: placeholder.subscribe },
    /**
     * Binds the editor to its contenteditable `root`, and keeps `field` holding the post body as
     * the JSON the post save reads. Returns the teardown.
     */
    mount(root: HTMLElement, field: HTMLInputElement) {
      const sync = (state: EditorState) => {
        field.value = JSON.stringify(state.toJSON());
        placeholder.set(state.read(() => $canShowPlaceholder(editor)));
      };

      editor.setRootElement(root);
      sync(editor.getEditorState());
      const unregister = mergeRegister(
        registerRichText(editor),
        registerList(editor),
        registerHistory(editor, createEmptyHistoryState(), HISTORY_DELAY),
        editor.registerUpdateListener(({ editorState: state }) => sync(state))
      );

      return () => {
        unregister();
        editor.setRootElement(null);
      };
    },
  };
}
