import { CodeNode } from '@lexical/code';
import { ListNode, ListItemNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { ListPlugin } from '@lexical/react/LexicalListPlugin.js';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin.js';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { LexicalEditor, SerializedEditorState } from 'lexical';
import { useTranslation } from 'react-i18next';

import BlockToolbarPlugin from './plugins/BlockToolbarPlugin';
import HiddenFieldPlugin from './plugins/HiddenFieldPlugin';
import ImageNode from './plugins/ImageNode';
import InlineToolbarPlugin from './plugins/InlineToolbarPlugin';
import VideoNode from './plugins/VideoNode';
import theme from './theme';

function Placeholder() {
  const { t } = useTranslation();

  return <div className="editor-placeholder">{t('editor.placeholder')}</div>;
}

export default function Editor({ editorState }: { editorState?: SerializedEditorState }) {
  const editorConfig = {
    namespace: 'HighForThis',
    theme,
    // without a saved body, Lexical starts the post with an empty paragraph to write in
    editorState: editorState?.root?.children?.length ? JSON.stringify(editorState) : undefined,
    nodes: [HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, ImageNode, VideoNode],
    onError(error: Error, editor: LexicalEditor) {
      // Throw while the saved post loads, so a partly parsed post can't be saved over it. After
      // that, returning lets Lexical drop the failed update and restore the last good state;
      // throwing would leave the update pending, and the editor would stop taking input.
      if (editor.getEditorState().isEmpty()) {
        throw error;
      }
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <HiddenFieldPlugin />
      {/* the negative offset makes room for the block toolbar handle, which only fits on wide screens */}
      <div className="editor-container relative left-0 lg:-left-6">
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
        </div>
        <InlineToolbarPlugin />
        <BlockToolbarPlugin />
      </div>
    </LexicalComposer>
  );
}
