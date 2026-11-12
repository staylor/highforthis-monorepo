import { $createCodeNode, $isCodeNode } from '@lexical/code';
import {
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
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
import type { ElementNode, LexicalCommand, LexicalNode } from 'lexical';
import { useCallback, useEffect, useReducer, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';

import MediaModal from '#/components/Admin/Modals/Media';
import VideoModal from '#/components/Admin/Modals/Video';
import Controls from '#/components/Editor/Controls';
import BlockButton from '#/components/Editor/Controls/BlockButton';
import StyleButton from '#/components/Editor/Controls/StyleButton';
import Toolbar from '#/components/Editor/Toolbar';
import Icon from '#/components/Icon';
import type { ImageUpload, Video } from '#/types/graphql';

import { $createImageNode } from './ImageNode';
import { $createVideoNode } from './VideoNode';

type Modals = Record<'media' | 'video', boolean>;

const allModals = (): Modals => ({ media: false, video: false });
const reducer = (_prev: Modals, action: Partial<Modals>) => ({ ...allModals(), ...action });

interface BlockType {
  label: ReactNode;
  style: string;
  // what the button does: turn the line into a block, into a list, or open a media picker
  $createBlock?: () => ElementNode;
  listCommand?: LexicalCommand<void>;
  modal?: keyof Modals;
}

const iconClass = 'h-4 w-4';

const BLOCK_TYPES: BlockType[] = [
  { label: 'H2', style: 'h2', $createBlock: () => $createHeadingNode('h2') },
  { label: 'H3', style: 'h3', $createBlock: () => $createHeadingNode('h3') },
  { label: <Icon name="media" className={iconClass} />, style: 'atomic-image', modal: 'media' },
  { label: <Icon name="video" className={iconClass} />, style: 'video', modal: 'video' },
  {
    label: <Icon name="quote" className={iconClass} />,
    style: 'blockquote',
    $createBlock: () => $createQuoteNode(),
  },
  {
    label: <Icon name="listBullet" className={iconClass} />,
    style: 'bullet',
    listCommand: INSERT_UNORDERED_LIST_COMMAND,
  },
  {
    label: <Icon name="listOrdered" className={iconClass} />,
    style: 'number',
    listCommand: INSERT_ORDERED_LIST_COMMAND,
  },
  {
    label: <Icon name="code" className={iconClass} />,
    style: 'code',
    $createBlock: () => $createCodeNode(),
  },
];

// the toolbar sits this far above the line its button is on
const BLOCK_TOOLBAR_OFFSET = 40;

interface BlockControls {
  visible: boolean;
  open: boolean;
  // the line's offset from the top of the editor
  top: number;
  // the line's block type, named like BLOCK_TYPES' styles; empty for a paragraph
  style: string;
}

const hiddenControls: BlockControls = { visible: false, open: false, top: 0, style: '' };

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

function $getBlockStyle(line: ElementNode) {
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

export default function BlockToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [controls, setControls] = useState(hiddenControls);
  const [modals, setModals] = useReducer(reducer, allModals());

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        const next = editorState.read(
          () => {
            const line = $getLineAtCaret();
            const element = line && editor.getElementByKey(line.getKey());
            const root = editor.getRootElement();
            if (!line || !element || !root) {
              return null;
            }

            const style = $getBlockStyle(line);
            return {
              visible: true,
              // a line that already has a block type opens the toolbar, to change or undo it
              open: style !== '',
              top: element.getBoundingClientRect().top - root.getBoundingClientRect().top,
              style,
            };
          },
          { editor }
        );

        setControls((prev) => {
          if (!next) {
            return prev.visible ? { ...prev, visible: false, open: false } : prev;
          }
          const unchanged =
            prev.visible &&
            prev.open === next.open &&
            prev.top === next.top &&
            prev.style === next.style;
          return unchanged ? prev : next;
        });
      }),
    [editor]
  );

  const toggleBlock = useCallback(
    (type: BlockType) => {
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
    },
    [editor]
  );

  const closeModal = (e: SyntheticEvent) => {
    e.preventDefault();
    setModals({});
  };

  return (
    <>
      <BlockButton
        active={controls.open}
        style={{ top: controls.top, scale: controls.visible ? '1' : undefined }}
        onMouseDown={() => setControls((prev) => ({ ...prev, open: !prev.open }))}
      />
      <Toolbar
        className="-left-7 after:right-auto after:left-1"
        style={{
          top: controls.top - BLOCK_TOOLBAR_OFFSET,
          scale: controls.visible && controls.open ? '1' : undefined,
        }}
      >
        <Controls>
          {BLOCK_TYPES.map((type) => (
            <StyleButton
              key={type.style}
              active={controls.style === type.style}
              label={type.label}
              onToggle={() => {
                if (type.modal) {
                  setModals({ [type.modal]: true });
                  return;
                }
                toggleBlock(type);
              }}
              style={type.style}
            />
          ))}
        </Controls>
      </Toolbar>
      {modals.media && (
        <MediaModal
          selectImage={({ image, size }) => {
            editor.update(() => {
              $insertBlock($createImageNode(image as ImageUpload, size));
            });
          }}
          selectAudio={() => {}}
          onClose={closeModal}
        />
      )}
      {modals.video && (
        <VideoModal
          selectVideo={({ video }) => {
            editor.update(() => {
              $insertBlock($createVideoNode(video as Video));
            });
          }}
          onClose={closeModal}
        />
      )}
    </>
  );
}
