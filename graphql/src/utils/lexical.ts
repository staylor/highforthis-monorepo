interface LexicalNode {
  type?: string;
  text?: string;
  children?: LexicalNode[];
}

interface EditorState {
  root?: LexicalNode;
}

/**
 * Extract plain text from a Lexical editor state JSON.
 * Recursively walks the node tree and collects all "text" node values.
 */
export function extractText(editorState: EditorState): string {
  if (!editorState) return '';

  const parts: string[] = [];

  function walk(node: LexicalNode) {
    if (!node) return;

    if (node.type === 'text' && typeof node.text === 'string') {
      parts.push(node.text);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child);
      }
      // Add newline after block-level nodes
      if (['paragraph', 'heading', 'quote', 'listitem'].includes(node.type!)) {
        parts.push('\n');
      }
    }
  }

  // Start from root
  const root = editorState.root || (editorState as LexicalNode);
  walk(root);

  return parts.join('').trim();
}
