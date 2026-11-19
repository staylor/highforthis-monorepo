import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import type { LexicalEditor, TextFormatType } from 'lexical';

import { createStore, shallowEqual } from './store.ts';
import type { Store } from './store.ts';

/** The inline toolbar's buttons, in order. */
export const INLINE_FORMATS = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'superscript',
  'subscript',
  'code',
] as const satisfies TextFormatType[];

export type InlineFormat = (typeof INLINE_FORMATS)[number];

const TOOLBAR_HEIGHT = 32;
const TOOLBAR_OFFSET = 10;

interface Position {
  // the toolbar's offset from the editor's top left corner
  left: number;
  top: number;
  // the toolbar is against the editor's left edge, so its arrow can't point at the selection
  flush: boolean;
}

interface InlineToolbarState extends Position {
  // shown while text is selected
  visible: boolean;
  // which formats all of the selected text has
  formats: Record<InlineFormat, boolean>;
}

const noFormats = Object.fromEntries(INLINE_FORMATS.map((format) => [format, false])) as Record<
  InlineFormat,
  boolean
>;

const isEqual = (a: InlineToolbarState, b: InlineToolbarState) =>
  shallowEqual({ ...a, formats: null }, { ...b, formats: null }) &&
  shallowEqual(a.formats, b.formats);

/** Where the toolbar goes: centered above the selection, without passing the editor's left edge. */
export function positionInlineToolbar(
  selection: DOMRect,
  editor: DOMRect,
  toolbarWidth: number
): Position {
  const widthDiff = selection.width - toolbarWidth;
  const left =
    widthDiff >= 0
      ? Math.max(widthDiff / 2, 0)
      : Math.max(selection.left - editor.left + widthDiff / 2, 0);

  return {
    left,
    top: selection.top - editor.top - TOOLBAR_HEIGHT - TOOLBAR_OFFSET,
    flush: left === 0,
  };
}

interface InlineToolbar extends Store<InlineToolbarState> {
  /** Follows the editor's selection. `toolbar` is the rendered toolbar, measured to center it. */
  register: (toolbar: HTMLElement) => () => void;
  toggleFormat: (format: InlineFormat) => void;
}

/** The toolbar that floats over selected text, to format it. */
export function createInlineToolbar(editor: LexicalEditor): InlineToolbar {
  const store = createStore<InlineToolbarState>(
    { visible: false, formats: noFormats, left: 0, top: 0, flush: false },
    isEqual
  );

  function $update(toolbar: HTMLElement) {
    const prev = store.get();
    const selection = $getSelection();
    // an image or video picked with the arrow keys is a node selection, with no text to format
    if (!$isRangeSelection(selection)) {
      store.set({ ...prev, visible: false });
      return;
    }

    const formats = { ...noFormats };
    INLINE_FORMATS.forEach((format) => {
      formats[format] = selection.hasFormat(format);
    });

    if (selection.isCollapsed()) {
      store.set({ ...prev, formats, visible: false });
      return;
    }

    const root = editor.getRootElement();
    const selected = window.getSelection();
    if (!root || !selected?.rangeCount) {
      store.set({ ...prev, formats });
      return;
    }

    const position = positionInlineToolbar(
      selected.getRangeAt(0).getBoundingClientRect(),
      root.getBoundingClientRect(),
      toolbar.offsetWidth
    );
    store.set({ ...position, formats, visible: true });
  }

  return {
    get: store.get,
    subscribe: store.subscribe,
    register: (toolbar) =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => $update(toolbar), { editor });
        }),
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            $update(toolbar);
            return false;
          },
          COMMAND_PRIORITY_LOW
        )
      ),
    toggleFormat: (format) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
  };
}
