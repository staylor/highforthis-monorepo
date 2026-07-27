import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { mergeRegister } from '@lexical/utils';
import type { RangeSelection, TextFormatType } from 'lexical';
import { $getSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import type { ReactNode } from 'react';
import { useRef, useEffect, useCallback, useReducer, useMemo } from 'react';

import Controls from '#/components/Editor/Controls';
import StyleButton from '#/components/Editor/Controls/StyleButton';
import Toolbar from '#/components/Editor/Toolbar';
import Icon from '#/components/Icon';

import { setStyle } from './utils';

const LowPriority = 1;

const TOOLBAR_HEIGHT = 32;
const TOOLBAR_OFFSET = 10;

interface InlineStyle {
  label: ReactNode;
  style: TextFormatType;
  className?: string;
}

const iconClass = 'h-4 w-4';

const INLINE_STYLES: InlineStyle[] = [
  { label: <Icon name="bold" className={iconClass} />, style: 'bold' },
  {
    label: <Icon name="italic" className={iconClass} />,
    style: 'italic',
  },
  {
    label: <Icon name="underline" className={iconClass} />,
    style: 'underline',
  },
  {
    label: <Icon name="strikethrough" className={iconClass} />,
    style: 'strikethrough',
  },
  {
    label: (
      <>
        X<sup>2</sup>
      </>
    ),
    style: 'superscript',
  },
  {
    label: (
      <>
        X<sub>2</sub>
      </>
    ),
    style: 'subscript',
  },
  { label: <Icon name="code" className={iconClass} />, style: 'code' },
];

type Formats = Record<TextFormatType, boolean>;

const reducer = (prev: Formats, action: Formats) => ({ ...prev, ...action });

export default function InlineToolbarPlugin() {
  const defaultFormats = useMemo(
    () =>
      INLINE_STYLES.reduce((carry, def) => {
        carry[def.style] = false;
        return carry;
      }, {} as Formats),
    []
  );
  const [formats, setFormats] = useReducer(reducer, defaultFormats);

  const inlineToolbarRef = useRef(null);
  const [editor] = useLexicalComposerContext();

  const $updateToolbar = useCallback(() => {
    if (!inlineToolbarRef.current) {
      return;
    }

    const selection = $getSelection() as RangeSelection;
    if (!selection) {
      return;
    }

    const updates = {} as Formats;
    INLINE_STYLES.forEach(({ style }) => {
      updates[style] = selection.hasFormat?.(style);
    });
    setFormats(updates);

    const range = selection as RangeSelection;
    const anchorOffset = range.anchor.offset;
    const focusOffset = range.focus.offset;

    // empty selection
    if (anchorOffset === focusOffset) {
      setStyle(inlineToolbarRef, {
        scale: '0',
      });
      return;
    }

    const editorRef = editor.getRootElement();
    const editorBoundary = editorRef?.getBoundingClientRect();
    if (!editorBoundary) {
      return;
    }

    const toolbar = inlineToolbarRef.current as HTMLElement;
    const toolbarWidth = toolbar.offsetWidth;
    const selected = window.getSelection() as Selection;
    const selectionBoundary = selected.getRangeAt(0).getBoundingClientRect();

    const widthDiff = selectionBoundary.width - toolbarWidth;
    let leftOffset;
    if (widthDiff >= 0) {
      leftOffset = Math.max(widthDiff / 2, 0);
    } else {
      const left = selectionBoundary.left - editorBoundary.left;
      leftOffset = Math.max(left + widthDiff / 2, 0);
    }
    // this class allows us to style the toolbar arrow with CSS
    if (leftOffset === 0) {
      toolbar.classList.add('Toolbar-flush');
    } else {
      toolbar.classList.remove('Toolbar-flush');
    }
    setStyle(inlineToolbarRef, {
      left: `${leftOffset}px`,
      top: `${selectionBoundary.top - editorBoundary.top - TOOLBAR_HEIGHT - TOOLBAR_OFFSET}px`,
      scale: '1',
    });
  }, [editor]);

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority
      )
    );
    return unregister;
  }, [editor, $updateToolbar]);

  return (
    <Toolbar ref={inlineToolbarRef}>
      <Controls>
        {INLINE_STYLES.map((type) => (
          <StyleButton
            key={type.style}
            className={type.className}
            active={formats[type.style]}
            label={type.label}
            onToggle={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, type.style);
            }}
            style={type.style}
          />
        ))}
      </Controls>
    </Toolbar>
  );
}
