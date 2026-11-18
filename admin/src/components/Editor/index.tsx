import type { SerializedEditorState } from 'lexical';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BlockToolbar from './BlockToolbar';
import InlineToolbar from './InlineToolbar';
import { createPostEditor } from './core/editor';
import theme from './theme';
import useStore from './useStore';

/**
 * Hosts the post editor (`core/editor`) in React: renders its contenteditable element, form field,
 * placeholder and toolbars, and mounts the editor on them.
 */
export default function Editor({ editorState }: { editorState?: SerializedEditorState }) {
  const { t } = useTranslation();
  const [postEditor] = useState(() => createPostEditor({ theme, editorState }));
  const showPlaceholder = useStore(postEditor.placeholder);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);

  // mount before the browser paints, so the post doesn't flash empty
  useLayoutEffect(
    () => postEditor.mount(rootRef.current as HTMLElement, fieldRef.current as HTMLInputElement),
    [postEditor]
  );

  return (
    <>
      <input ref={fieldRef} type="hidden" name="editorState" />
      {/* the negative offset makes room for the block toolbar handle, which only fits on wide screens */}
      <div className="editor-container relative left-0 lg:-left-6">
        <div className="editor-inner">
          {/* Lexical renders the post into this element */}
          <div
            ref={rootRef}
            className="editor-input"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            spellCheck
          />
          {showPlaceholder && <div className="editor-placeholder">{t('editor.placeholder')}</div>}
        </div>
        <InlineToolbar editor={postEditor.editor} />
        <BlockToolbar editor={postEditor.editor} />
      </div>
    </>
  );
}
