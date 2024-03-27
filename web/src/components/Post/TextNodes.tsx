import { gql } from 'graphql-tag';

import type { TextNode } from '@/types/graphql';

const FORMATS = {
  BOLD: 1,
  ITALIC: 2,
  STRIKETHROUGH: 4,
  UNDERLINE: 8,
  CODE: 16,
  SUBSCRIPT: 32,
  SUPERSCRIPT: 64,
  HIGHLIGHT: 128,
};

function TextNodes({ nodes }: { nodes: TextNode[] }) {
  return (
    <>
      {nodes.map((node, idx) => {
        const key = idx.toString();
        if (node.type === 'linebreak') {
          return <br key={`br-${key}`} />;
        }

        const text = (node as TextNode).text;
        switch (node.format) {
          case FORMATS.BOLD:
            return <strong key={`strong-${key}`}>{text}</strong>;
          case FORMATS.ITALIC:
            return <em key={`em-${key}`}>{text}</em>;
          case FORMATS.UNDERLINE:
            return <u key={`u-${key}`}>{text}</u>;
          case FORMATS.CODE:
            return <code key={`code-${key}`}>{text}</code>;
          case FORMATS.BOLD | FORMATS.ITALIC:
            return (
              <strong key={`strong-${key}`}>
                <em key={`em-${key}`}>{text}</em>
              </strong>
            );
          case FORMATS.BOLD | FORMATS.UNDERLINE:
            return (
              <strong key={`strong-${key}`}>
                <u key={`u-${key}`}>{text}</u>
              </strong>
            );
          case FORMATS.ITALIC | FORMATS.UNDERLINE:
            return (
              <em key={`em-${key}`}>
                <u key={`u-${key}`}>{text}</u>
              </em>
            );
          case FORMATS.BOLD | FORMATS.ITALIC | FORMATS.UNDERLINE:
            return (
              <strong key={`strong-${key}`}>
                <em key={`em-${key}`}>
                  <u key={`u-${key}`}>{text}</u>
                </em>
              </strong>
            );
        }
        return text;
      })}
    </>
  );
}

TextNodes.fragments = {
  linebreakNode: gql`
    fragment TextNodes_linebreakNode on LinebreakNode {
      type
      version
    }
  `,
  textNode: gql`
    fragment TextNodes_textNode on TextNode {
      detail
      format
      mode
      style
      text
      type
      version
    }
  `,
};

export default TextNodes;
