import type {
  CodeNode,
  EditorState,
  ElementNode,
  HeadingNode,
  ImageNode,
  ImageUpload,
  QuoteNode,
  TextNode,
  Video,
  VideoNode,
} from '@/types/graphql';
import { HeadingTag } from '@/types/graphql';
import { uploadUrl } from '@/utils/media';
import Blockquote from '@/components/Blockquote';
import { Heading2, Heading3, Heading4 } from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import VideoComponent from '@/components/Videos/Video';

import PostTitle from './PostTitle';
import TextNodes from './TextNodes';

function isEmptyText(nodes: TextNode[]) {
  return nodes.length === 0 || nodes.filter(({ text }) => text?.trim()).length === 0;
}

export default function Content({ editorState }: { editorState: EditorState }) {
  return (
    <>
      {editorState.root?.children?.map((elem, idx) => {
        const key = idx.toString();
        switch (elem?.type) {
          case 'code':
            const code = elem as CodeNode;
            if (isEmptyText(code.children as TextNode[])) {
              return null;
            }

            return (
              <pre key={`pre-${key}`}>
                <TextNodes nodes={code.children as TextNode[]} />
              </pre>
            );
          case 'heading':
            const heading = elem as HeadingNode;
            const tag = heading.tag as HeadingTag;
            if (isEmptyText(heading.children as TextNode[])) {
              return null;
            }

            let Component = Heading3;
            switch (tag) {
              case HeadingTag.H1:
                Component = PostTitle;
                break;
              case HeadingTag.H2:
                Component = Heading2;
                break;
              case HeadingTag.H3:
                Component = Heading3;
                break;
              case HeadingTag.H4:
                Component = Heading4;
                break;
            }
            return (
              <Component key={`heading-${tag}-${key}`}>
                <TextNodes nodes={heading.children as TextNode[]} />
              </Component>
            );
          case 'image':
            const image = (elem as ImageNode).image as ImageUpload;
            let crop = image.crops.find((c) => c.width === 640);
            if (!crop) {
              [crop] = image.crops;
            }
            return (
              <img
                key={image.id}
                className="my-2.5"
                alt=""
                src={uploadUrl(image.destination, crop.fileName)}
              />
            );
          case 'paragraph':
            const paragraph = elem as ElementNode;
            if (isEmptyText(paragraph.children as TextNode[])) {
              return null;
            }

            return (
              <Paragraph key={`paragraph-${key}`}>
                <TextNodes nodes={paragraph.children as TextNode[]} />
              </Paragraph>
            );
          case 'quote':
            const quote = elem as QuoteNode;
            if (isEmptyText(quote.children as TextNode[])) {
              return null;
            }

            return (
              <Blockquote key={`quote-${key}`}>
                <TextNodes nodes={quote.children as TextNode[]} />
              </Blockquote>
            );
          case 'video':
            const video = (elem as VideoNode).video as Video;
            return <VideoComponent key={video.id} video={video} embed />;
        }
        return null;
      })}
    </>
  );
}
