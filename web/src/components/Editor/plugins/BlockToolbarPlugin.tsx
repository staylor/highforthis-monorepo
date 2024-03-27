import type { SyntheticEvent } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { LexicalNode, RangeSelection } from 'lexical';
import lexical from 'lexical';
import type { HeadingTagType } from '@lexical/rich-text';
import lexicalCode from '@lexical/code';
import type { ListType } from '@lexical/list';
import lexicalList from '@lexical/list';
import lexicalRichText from '@lexical/rich-text';
import lexicalSelection from '@lexical/selection';
import context from '@lexical/react/LexicalComposerContext.js';
import * as utils from '@lexical/utils';

import Toolbar from '@/components/Editor/Toolbar';
import Controls from '@/components/Editor/Controls';
import StyleButton from '@/components/Editor/Controls/StyleButton';
import BlockButton from '@/components/Editor/Controls/BlockButton';
import VideoModal from '@/components/Admin/Modals/Video';
import MediaModal from '@/components/Admin/Modals/Media';
import type { ImageUpload, Video } from '@/types/graphql';

import { getNodeFromSelection, getStyleFromNode, setStyle } from './utils';
import { $createVideoNode } from './VideoNode';
import { $createImageNode } from './ImageNode';

const { useLexicalComposerContext } = context;
const {
  $createParagraphNode,
  $getSelection,
  $getNearestNodeFromDOMNode,
  $isRangeSelection,
  $setSelection,
  SELECTION_CHANGE_COMMAND,
} = lexical;
const { $createCodeNode } = lexicalCode;
const { $createListNode } = lexicalList;
const { $createHeadingNode, $createQuoteNode } = lexicalRichText;
const { $setBlocksType } = lexicalSelection;
const { mergeRegister, $insertNodeToNearestRoot } = utils;

interface BlockType {
  label: string;
  nodeType?: string;
  style: string;
  className?: string;
  onToggle?: () => void;
}

const BLOCK_OFFSET = 7;
const BLOCK_TOOLBAR_OFFSET = 40;

const LowPriority = 1;

type Modals = Record<string, boolean>;

const allModals = () => ({ media: false, video: false });
const reducer = (_prev: Modals, action: Modals) => ({ ...allModals(), ...action });

export default function BlockToolbarPlugin() {
  const [activeStyle, setActiveStyle] = useState('');
  const [toolbarActive, setToolbarActive] = useState(false);
  const [modals, setModals] = useReducer(reducer, allModals());
  const selectionRef = useRef<RangeSelection>();
  const blockButtonRef = useRef(null);
  const blockToolbarRef = useRef(null);
  const [editor] = useLexicalComposerContext();

  const saveSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      selectionRef.current = $getSelection()?.clone() as RangeSelection;
    });
  }, [editor]);

  const restoreSelection = useCallback(
    (cb?: (selection: RangeSelection) => void) => {
      editor.update(() => {
        if (selectionRef.current) {
          $setSelection(selectionRef.current);
          if (cb) {
            cb(selectionRef.current);
          }
        }
      });
    },
    [editor]
  );

  const BLOCK_TYPES: BlockType[] = useMemo(
    () => [
      { label: 'H2', nodeType: 'heading', style: 'h2' },
      { label: 'H3', nodeType: 'heading', style: 'h3' },
      {
        label: '',
        style: 'atomic-image',
        className: 'dashicons dashicons-format-image',
        onToggle: () => {
          saveSelection();
          setModals({ media: true });
        },
      },
      {
        label: '',
        nodeType: 'video',
        style: 'video',
        className: 'dashicons dashicons-format-video',
        onToggle: () => {
          saveSelection();
          setModals({ video: true });
        },
      },
      {
        label: '',
        nodeType: 'quote',
        style: 'blockquote',
        className: 'dashicons dashicons-editor-quote',
      },
      {
        label: '',
        nodeType: 'list',
        style: 'bullet',
        className: 'dashicons dashicons-editor-ul',
      },
      {
        label: '',
        nodeType: 'list',
        style: 'number',
        className: 'dashicons dashicons-editor-ol',
      },
      {
        label: '',
        nodeType: 'code',
        style: 'code',
        className: 'dashicons dashicons-editor-code',
      },
    ],
    [setModals, saveSelection]
  );
  const ALL_TYPES = useMemo(
    () => BLOCK_TYPES.map((type) => type.nodeType).filter(Boolean),
    [BLOCK_TYPES]
  );

  const getTopOffset = useCallback(() => {
    const editorRef = editor.getRootElement();
    const editorBoundary = editorRef?.getBoundingClientRect();
    if (!editorBoundary) {
      return;
    }

    const selected = window.getSelection() as Selection;

    let bounds: DOMRect | undefined;
    if (selected.focusNode) {
      if ('getBoundingClientRect' in selected.focusNode) {
        bounds = (selected.focusNode as HTMLElement).getBoundingClientRect();
      } else if (
        selected.focusNode.parentElement &&
        'getBoundingClientRect' in selected.focusNode.parentElement
      ) {
        bounds = selected.focusNode.parentElement.getBoundingClientRect();
      }
    }
    if (!bounds) {
      return;
    }

    if (bounds.x === 0 && bounds.y === 0) {
      return;
    }
    return bounds.top - editorBoundary.top - BLOCK_OFFSET;
  }, [editor]);

  const hideToolbar = useCallback(() => {
    setStyle(blockToolbarRef, {
      transform: 'scale(0)',
    });
  }, []);

  const showToolbar = useCallback(() => {
    const offset = getTopOffset();
    if (offset) {
      setStyle(blockToolbarRef, {
        top: `${offset - BLOCK_TOOLBAR_OFFSET}px`,
        transform: 'scale(1)',
      });
    } else {
      hideToolbar();
    }
  }, [getTopOffset, hideToolbar]);

  const hideButton = useCallback(() => {
    setStyle(blockButtonRef, {
      transform: 'scale(0)',
    });
    setToolbarActive(false);
    setActiveStyle('');
  }, [setToolbarActive, setActiveStyle]);

  const showButton = useCallback(() => {
    const topOffset = getTopOffset();
    if (topOffset) {
      setStyle(blockButtonRef, {
        top: `${topOffset}px`,
        transform: 'scale(1)',
      });
    } else {
      hideButton();
    }
  }, [getTopOffset, hideButton]);

  const updateButton = useCallback(() => {
    const selection = $getSelection() as RangeSelection;
    if (!selection) {
      hideButton();
      return;
    }

    const range = selection as RangeSelection;
    const anchorOffset = range.anchor.offset;
    const focusOffset = range.focus.offset;

    if (anchorOffset === 0 && focusOffset === 0) {
      showButton();

      editor.update(() => {
        const selectedNode = getNodeFromSelection();
        if (!selectedNode) {
          return;
        }

        const node = $getNearestNodeFromDOMNode(selectedNode) as LexicalNode;
        if (!node) {
          return;
        }
        if (ALL_TYPES.includes(node.__type)) {
          const style = getStyleFromNode(node) as string;

          setToolbarActive(true);
          setActiveStyle(style);
        } else {
          setToolbarActive(false);
          setActiveStyle('');
        }
      });
    } else {
      hideButton();
    }
  }, [editor, showButton, hideButton, ALL_TYPES]);

  useEffect(() => {
    if (!blockToolbarRef.current) {
      return;
    }

    if (toolbarActive) {
      showToolbar();
    } else {
      hideToolbar();
    }
  }, [toolbarActive, blockToolbarRef, showToolbar, hideToolbar]);

  useEffect(() => {
    mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateButton();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateButton();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateButton]);

  const onToggle = useCallback(
    (type: BlockType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const selectedNode = getNodeFromSelection() as HTMLElement;
          const node = $getNearestNodeFromDOMNode(selectedNode) as LexicalNode;

          // This is when a type (e.g. 'quote') is active on the current node, and you click it again
          // Setting to ParagraphNode removes the special treatment
          if (ALL_TYPES.includes(node.__type) && type.style === activeStyle) {
            $setBlocksType(selection, () => $createParagraphNode());
            setActiveStyle('');
            return;
          }

          switch (type.nodeType) {
            case 'heading':
              $setBlocksType(selection, () => $createHeadingNode(type.style as HeadingTagType));
              setActiveStyle(type.style);
              break;
            case 'quote':
              $setBlocksType(selection, () => $createQuoteNode());
              setActiveStyle(type.style);
              break;
            case 'code':
              $setBlocksType(selection, () => $createCodeNode());
              setActiveStyle(type.style);
              break;
            case 'list':
              $setBlocksType(selection, () => $createListNode(type.style as ListType));
              setActiveStyle(type.style);
              break;
          }
        }
      });
    },
    [editor, activeStyle, setActiveStyle, ALL_TYPES]
  );

  return (
    <>
      <BlockButton
        ref={blockButtonRef as any}
        active={toolbarActive}
        onMouseDown={() => {
          setToolbarActive(!toolbarActive);
        }}
      />
      <Toolbar ref={blockToolbarRef} className="-left-7 after:left-1 after:right-auto">
        <Controls>
          {BLOCK_TYPES.map((type) => (
            <StyleButton
              key={type.style}
              className={type.className as string}
              active={activeStyle === type.style}
              label={type.label}
              onToggle={() => {
                if (type.onToggle) {
                  type.onToggle();
                  return;
                }
                onToggle(type);
              }}
              style={type.style}
            />
          ))}
        </Controls>
      </Toolbar>
      {modals.media && (
        <MediaModal
          selectImage={({ image, size }) => {
            restoreSelection(() => {
              const node = $createImageNode(image as ImageUpload, size);
              $insertNodeToNearestRoot(node);
            });
          }}
          selectAudio={() => {}}
          onClose={(e) => {
            e.preventDefault();
            restoreSelection();
            setModals({});
          }}
        />
      )}
      {modals.video && (
        <VideoModal
          selectVideo={({ video }) => {
            restoreSelection(() => {
              const node = $createVideoNode(video as Video);
              $insertNodeToNearestRoot(node);
            });
          }}
          onClose={(e: SyntheticEvent) => {
            e.preventDefault();
            restoreSelection();
            setModals({});
          }}
        />
      )}
    </>
  );
}
