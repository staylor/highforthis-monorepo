import type { LexicalNode } from 'lexical';
import type { ListNode } from '@lexical/list';
import type { HeadingNode } from '@lexical/rich-text';
import type { CSSProperties } from 'react';

export const setStyle = (
  ref: React.MutableRefObject<HTMLElement | null>,
  styles: CSSProperties
) => {
  if (!ref?.current) {
    return;
  }

  Object.keys(styles).forEach((cssKey) => {
    const key = cssKey as keyof CSSProperties;
    // @ts-ignore
    (ref.current as HTMLElement).style[key] = styles[key];
  });
};

export function getNodeFromSelection() {
  const selected = window.getSelection() as Selection;
  if (!selected) {
    return;
  }
  let selectedNode = selected.focusNode?.parentElement as HTMLElement;
  if (!selectedNode) {
    return;
  }
  while (selectedNode?.parentElement) {
    if (selectedNode.parentElement.getAttribute('data-lexical-editor') === 'true') {
      break;
    }
    selectedNode = selectedNode.parentElement as HTMLElement;
  }
  return selectedNode;
}

export function getStyleFromNode(node: LexicalNode) {
  switch (node.__type) {
    case 'heading':
      return (node as HeadingNode).__tag;
    case 'quote':
      return 'blockquote';
    case 'code':
      return 'code';
    case 'list':
      return (node as ListNode).__listType;
    case 'video':
      return 'video';
    case 'image':
      return 'image';
  }
}
