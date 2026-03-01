/**
 * Extract plain text from a Lexical editor state JSON.
 * Recursively walks the node tree and collects all "text" node values.
 */
export function extractText(editorState: any): string {
  if (!editorState) return '';

  const parts: string[] = [];

  function walk(node: any) {
    if (!node) return;

    if (node.type === 'text' && typeof node.text === 'string') {
      parts.push(node.text);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child);
      }
      // Add newline after block-level nodes
      if (['paragraph', 'heading', 'quote', 'listitem'].includes(node.type)) {
        parts.push('\n');
      }
    }
  }

  // Start from root
  const root = editorState.root || editorState;
  walk(root);

  return parts.join('').trim();
}
