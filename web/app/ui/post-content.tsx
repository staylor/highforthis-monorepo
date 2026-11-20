import { gql } from 'graphql-tag';
import { css, type Handle, type RemixNode } from 'remix/component';

import { ListType } from '#/types/graphql.ts';
import type {
  CodeNode,
  EditorState,
  ElementNode,
  HeadingNode,
  ImageNode,
  ImageUpload,
  ListItemNode,
  ListNode,
  QuoteNode,
  TextNode,
  Video as VideoType,
  VideoNode,
} from '#/types/graphql.ts';

import { Heading2, Heading3, Heading4, PostTitle } from './heading.tsx';
import { uploadUrl } from './public/media.ts';
import { Video } from './videos.tsx';

export const textNodeFragments = gql`
  fragment TextNodes_linebreakNode on LinebreakNode {
    type
    version
  }
  fragment TextNodes_textNode on TextNode {
    detail
    format
    mode
    style
    text
    textFormat
    textStyle
    type
    version
  }
`;

const FORMATS = { BOLD: 1, ITALIC: 2, UNDERLINE: 8, CODE: 16 };

/** Text runs with their Lexical formatting. */
function textNodes(nodes: TextNode[]): RemixNode[] {
  return nodes.map((node) => {
    if (node.type === 'linebreak') {
      return <br />;
    }
    const text = node.text;
    switch (node.format) {
      case FORMATS.BOLD:
        return <strong>{text}</strong>;
      case FORMATS.ITALIC:
        return <em>{text}</em>;
      case FORMATS.UNDERLINE:
        return <u>{text}</u>;
      case FORMATS.CODE:
        return <code>{text}</code>;
      case FORMATS.BOLD | FORMATS.ITALIC:
        return (
          <strong>
            <em>{text}</em>
          </strong>
        );
      case FORMATS.BOLD | FORMATS.UNDERLINE:
        return (
          <strong>
            <u>{text}</u>
          </strong>
        );
      case FORMATS.ITALIC | FORMATS.UNDERLINE:
        return (
          <em>
            <u>{text}</u>
          </em>
        );
      case FORMATS.BOLD | FORMATS.ITALIC | FORMATS.UNDERLINE:
        return (
          <strong>
            <em>
              <u>{text}</u>
            </em>
          </strong>
        );
    }
    return text;
  });
}

function isEmptyText(nodes: TextNode[]) {
  return nodes.length === 0 || nodes.filter(({ text }) => text?.trim()).length === 0;
}

const contentImage = css({ marginBlock: '0.625rem' });
const orderedList = css({
  marginBlock: '1.25rem',
  marginLeft: '2rem',
  listStyleType: 'decimal',
});
const unorderedList = css({
  marginBlock: '1.25rem',
  marginLeft: '2rem',
  listStyleType: 'disc',
});
const paragraph = css({ marginBottom: '1.5rem' });
const quote = css({
  marginBlock: '1rem',
  borderLeft: '4px solid var(--detail)',
  padding: '0.625rem 1.25rem',
  fontFamily: 'var(--font-georgia)',
  color: '#666',
  fontStyle: 'italic',
});

const headings = {
  h1: PostTitle,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
} as const;

/** Renders a post's Lexical JSON from GraphQL, without Lexical. */
export function PostContent(handle: Handle<{ editorState: Partial<EditorState> }>) {
  return () =>
    handle.props.editorState.root?.children?.map((elem, idx) => {
      switch (elem?.type) {
        case 'code': {
          const children = (elem as CodeNode).children as TextNode[];
          return isEmptyText(children) ? null : <pre key={`pre-${idx}`}>{textNodes(children)}</pre>;
        }
        case 'heading': {
          const heading = elem as HeadingNode;
          const children = heading.children as TextNode[];
          if (isEmptyText(children)) {
            return null;
          }
          const Component = headings[heading.tag as keyof typeof headings] ?? Heading3;
          return <Component key={`heading-${idx}`}>{textNodes(children)}</Component>;
        }
        case 'image': {
          const image = (elem as ImageNode).image as ImageUpload;
          if (!image?.crops?.length) {
            return null;
          }
          const crop = image.crops.find(({ width }) => width === 640) || image.crops[0];
          return (
            <img
              key={image.id}
              mix={contentImage}
              alt=""
              src={uploadUrl(image.destination, crop.fileName)}
            />
          );
        }
        case 'list': {
          const list = elem as ListNode;
          const items = (list.children as ListItemNode[])
            .filter((item) => !isEmptyText(item.children as TextNode[]))
            .map((item) => <li>{textNodes(item.children as TextNode[])}</li>);
          if (items.length === 0) {
            return null;
          }
          return list.listType === ListType.Number ? (
            <ol key={`list-${idx}`} mix={orderedList} start={list.start ?? undefined}>
              {items}
            </ol>
          ) : (
            <ul key={`list-${idx}`} mix={unorderedList}>
              {items}
            </ul>
          );
        }
        case 'paragraph': {
          const children = (elem as ElementNode).children as TextNode[];
          return isEmptyText(children) ? null : (
            <p key={`paragraph-${idx}`} mix={paragraph}>
              {textNodes(children)}
            </p>
          );
        }
        case 'quote': {
          const children = (elem as QuoteNode).children as TextNode[];
          return isEmptyText(children) ? null : (
            <blockquote key={`quote-${idx}`} mix={quote}>
              {textNodes(children)}
            </blockquote>
          );
        }
        case 'video': {
          const video = (elem as VideoNode).video as VideoType;
          return <Video key={video.id} video={video} embed />;
        }
      }
      return null;
    });
}
