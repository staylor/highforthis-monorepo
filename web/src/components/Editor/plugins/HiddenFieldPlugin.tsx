import context from '@lexical/react/LexicalComposerContext.js';
import { useEffect, useState } from 'react';

const { useLexicalComposerContext } = context;

export default function HiddenFieldPlugin() {
  const [fieldValue, setFieldValue] = useState('');
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      const data = editorState.toJSON();
      const serialized = JSON.stringify(data);
      setFieldValue(serialized);
    });
  }, [editor]);

  return <input type="hidden" name="editorState" value={fieldValue} />;
}
