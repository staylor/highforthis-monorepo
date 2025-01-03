import { CodeNode } from '@lexical/code';
import { ListNode, ListItemNode } from '@lexical/list';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin.js';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin.js';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { LexicalEditor, SerializedEditorState } from 'lexical';

import BlockToolbarPlugin from './plugins/BlockToolbarPlugin';
import HiddenFieldPlugin from './plugins/HiddenFieldPlugin';
import ImageNode from './plugins/ImageNode';
import InlineToolbarPlugin from './plugins/InlineToolbarPlugin';
import VideoNode from './plugins/VideoNode';
import theme from './theme';

function Placeholder() {
  return <div className="editor-placeholder">Start writing...</div>;
}

export default function Editor({ editorState }: { editorState: SerializedEditorState }) {
  const editorConfig = {
    namespace: 'HighForThis',
    theme,
    editorState: (editor: LexicalEditor) => {
      if (!editorState) {
        return;
      }

      const parsed = editor.parseEditorState(editorState);
      editor.setEditorState(parsed);
    },
    nodes: [HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, ImageNode, VideoNode],
    onError(error: Error) {
      throw error;
    },
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <HiddenFieldPlugin />
      <div className="editor-container relative -left-6">
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </div>
        <InlineToolbarPlugin />
        <BlockToolbarPlugin />
      </div>
    </LexicalComposer>
  );
}
