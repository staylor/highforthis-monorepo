import { $createCodeNode, $isCodeNode } from '@lexical/code-core';
import {
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
} from 'lexical';
import type { ElementNode, LexicalCommand, LexicalEditor, LexicalNode } from 'lexical';

import type { ImageUpload, Video } from '#/types/graphql';

import { $createImageNode } from './ImageNode';
import { $createVideoNode } from './VideoNode';
import { createStore, shallowEqual } from './store';
import type { Store } from './store';

/** The pickers that choose what an image or video block shows. */
type Picker = 'media' | 'video';

interface BlockType {
  style: string;
  // what the button does: turn the line into a block, into a list, or open a picker
  $createBlock?: () => ElementNode;
  listCommand?: LexicalCommand<void>;
  picker?: Picker;
}

/** The block toolbar's buttons, in order. Each style names the block type it makes. */
export const BLOCK_TYPES = [
  { style: 'h2', $createBlock: () => $createHeadingNode('h2') },
  { style: 'h3', $createBlock: () => $createHeadingNode('h3') },
  { style: 'atomic-image', picker: 'media' },
  { style: 'video', picker: 'video' },
  { style: 'blockquote', $createBlock: () => $createQuoteNode() },
  { style: 'bullet', listCommand: INSERT_UNORDERED_LIST_COMMAND },
  { style: 'number', listCommand: INSERT_ORDERED_LIST_COMMAND },
  { style: 'code', $createBlock: () => $createCodeNode() },
] as const satisfies BlockType[];

export type BlockStyle = (typeof BLOCK_TYPES)[number]['style'];

// the toolbar sits this far above the line its button is on
const BLOCK_TOOLBAR_OFFSET = 40;

interface BlockToolbarState {
  // the button shows at the start of an empty or untouched line
  visible: boolean;
  // the toolbar of block types is open next to the button
  open: boolean;
  // the button's and the toolbar's offsets from the top of the editor
  top: number;
  toolbarTop: number;
  // the line's block type, named like BLOCK_TYPES' styles; empty for a paragraph
  style: string;
  // the picker open to choose an image or video
  picker: Picker | null;
}

/**
 * The line a collapsed caret is at the very start of, which is where the block controls show:
 * a list item, or the top-level block the caret is in. Null anywhere else.
 */
function $getLineAtCaret(): ElementNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) {
    return null;
  }

  let node: LexicalNode | null = selection.anchor.getNode();
  while (node && !$isRootOrShadowRoot(node)) {
    if ($isListItemNode(node) || $isRootOrShadowRoot(node.getParent())) {
      return $isElementNode(node) ? node : null;
    }
    // the caret is past the start of the line
    if (node.getPreviousSibling()) {
      return null;
    }
    node = node.getParent();
  }
  return null;
}

function $getBlockStyle(line: ElementNode): string {
  const block = $isListItemNode(line) ? line.getParent() : line;
  if ($isListNode(block)) {
    return block.getListType();
  }
  if ($isHeadingNode(block)) {
    return block.getTag();
  }
  if ($isQuoteNode(block)) {
    return 'blockquote';
  }
  if ($isCodeNode(block)) {
    return 'code';
  }
  return '';
}

/**
 * Images and videos go on the caret's line: an empty line becomes the block, with a new line after
 * it to keep writing, and otherwise the block goes above the line and the caret stays where it is.
 */
function $insertBlock(node: LexicalNode) {
  const line = $getLineAtCaret();
  if ($isParagraphNode(line) && line.isEmpty()) {
    line.replace(node);
    const paragraph = $createParagraphNode();
    node.insertAfter(paragraph);
    paragraph.select();
  } else if (line && $isRootOrShadowRoot(line.getParent())) {
    line.insertBefore(node);
  } else {
    $insertNodeToNearestRoot(node);
  }
}

interface BlockToolbar extends Store<BlockToolbarState> {
  /** Follows the caret, to show the controls at the start of its line. */
  register: () => () => void;
  /** The button at the start of the line opens and closes the toolbar. */
  toggleOpen: () => void;
  /** A toolbar button: changes the line's block type, or opens the picker for an image or video. */
  choose: (style: BlockStyle) => void;
  closePicker: () => void;
  insertImage: (image: ImageUpload, size: string) => void;
  insertVideo: (video: Video) => void;
}

/** The controls at the start of a line, to change its block type or add an image or video. */
export function createBlockToolbar(editor: LexicalEditor): BlockToolbar {
  const store = createStore<BlockToolbarState>(
    { visible: false, open: false, top: 0, toolbarTop: 0, style: '', picker: null },
    shallowEqual
  );

  const update = (state: Partial<BlockToolbarState>) => store.set({ ...store.get(), ...state });

  function $readLine() {
    const line = $getLineAtCaret();
    const element = line && editor.getElementByKey(line.getKey());
    const root = editor.getRootElement();
    if (!line || !element || !root) {
      return null;
    }

    const style = $getBlockStyle(line);
    const top = element.getBoundingClientRect().top - root.getBoundingClientRect().top;
    return {
      visible: true,
      // a line that already has a block type opens the toolbar, to change or undo it
      open: style !== '',
      top,
      toolbarTop: top - BLOCK_TOOLBAR_OFFSET,
      style,
    };
  }

  function toggleBlock(type: BlockType) {
    editor.update(() => {
      const line = $getLineAtCaret();
      if (!line) {
        return;
      }

      const selection = $getSelection();
      if ($getBlockStyle(line) === type.style) {
        // pressing the line's own type again turns it back into a paragraph
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (type.listCommand) {
        editor.dispatchCommand(type.listCommand, undefined);
      } else if (type.$createBlock) {
        $setBlocksType(selection, type.$createBlock);
      }
    });
  }

  return {
    get: store.get,
    subscribe: store.subscribe,
    register: () =>
      editor.registerUpdateListener(({ editorState }) => {
        const next = editorState.read($readLine, { editor });
        update(next ?? { visible: false, open: false });
      }),
    toggleOpen: () => update({ open: !store.get().open }),
    choose: (style) => {
      const type: BlockType | undefined = BLOCK_TYPES.find((t) => t.style === style);
      if (type?.picker) {
        update({ picker: type.picker });
      } else if (type) {
        toggleBlock(type);
      }
    },
    closePicker: () => update({ picker: null }),
    insertImage: (image, size) => {
      editor.update(() => {
        $insertBlock($createImageNode(image, size));
      });
    },
    insertVideo: (video) => {
      editor.update(() => {
        $insertBlock($createVideoNode(video));
      });
    },
  };
}
