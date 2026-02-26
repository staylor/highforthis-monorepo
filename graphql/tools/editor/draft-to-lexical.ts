import fs from 'fs';
import path from 'path';

import prisma from '~/database';

const writeDir = path.join(process.cwd(), 'tools', 'editor', 'converted');
const fileName = (id: string) => `${writeDir}/${id}.json`;
const writeFile = (name: string, data: any) => {
  fs.writeFileSync(name, JSON.stringify(data, null, 2) + '\n');
};

const FORMATS: Record<string, number> = {
  BOLD: 1,
  ITALIC: 2,
  STRIKETHROUGH: 4,
  UNDERLINE: 8,
  CODE: 16,
  SUBSCRIPT: 32,
  SUPERSCRIPT: 64,
  HIGHLIGHT: 128,
};

const ENTITY_TO_TYPE: Record<string, string> = {
  IMAGE: 'image',
  VIDEO: 'video',
};

const TYPE_TO_TYPE: Record<string, string> = {
  'header-three': 'heading',
  unstyled: 'paragraph',
};

const TYPE_TO_TAG: Record<string, string> = {
  'header-three': 'h3',
};

async function main() {
  const posts = await prisma.post.findMany();

  for (const post of posts) {
    const { id: postId } = post;
    const file = fileName(postId);

    if (fs.existsSync(file)) {
      const editorState = await import(file);
      console.log('Setting editorState for', postId);
      await prisma.post.update({
        where: { id: postId },
        data: { editorState: editorState.default },
      });
      continue;
    }

    const contentState = (post as any).contentState;
    if (!contentState) continue;

    const data = {
      root: {
        direction: 'ltr',
        format: 0,
        indent: 0,
        type: 'root',
        version: 1,
        children: [] as any[],
      },
    };

    for (const block of contentState.blocks) {
      if (block.type === 'atomic') {
        const [range] = block.entityRanges;
        const entity = contentState.entityMap[range.key];
        const { type, ...rest } = entity.data;
        let fields = rest;

        switch (type) {
          case 'IMAGE':
            fields = {
              imageId: fields.imageId,
              size: fields.size,
            };
            break;
          case 'VIDEO':
            const record = await prisma.video.findUnique({ where: { id: fields.videoId } });
            if (record) {
              fields = {
                videoId: fields.videoId,
              };
            } else {
              fields = {
                error: 'Looks like this video no longer exists.',
              };
            }
            break;
        }

        data.root.children.push({
          ...fields,
          format: 0,
          indent: 0,
          type: ENTITY_TO_TYPE[type],
          version: 1,
        });
      } else {
        const children = [] as any[];
        if (block.inlineStyleRanges.length > 0) {
          let nextIndex = 0;
          const text = block.text;
          const segments: any[] = [];
          const inlineLength = block.inlineStyleRanges.length;
          for (let i = 0; i < inlineLength; i += 1) {
            const range = block.inlineStyleRanges[i];
            if (segments.length === 0 && range.offset > 0) {
              segments.push({
                text: text.substring(0, range.offset),
                range: {},
              });
            }
            if (nextIndex > 0 && nextIndex < range.offset) {
              segments.push({
                text: text.substring(nextIndex, range.offset),
                range: {},
              });
            }

            segments.push({
              text: text.substring(range.offset, range.offset + range.length),
              range,
            });

            nextIndex = range.offset + range.length;

            if (i + 1 === inlineLength && nextIndex < text.length) {
              segments.push({
                text: text.substring(nextIndex),
                range: {},
              });
            }
          }

          for (const { text, range } of segments) {
            children.push({
              detail: 0,
              format: range.style ? FORMATS[range.style] : 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            });
          }
        } else {
          children.push({
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: block.text,
            type: 'text',
            version: 1,
          });
        }

        const blockType = TYPE_TO_TYPE[block.type];
        if (
          blockType === 'paragraph' &&
          children.filter((node: any) => node.type === 'text' && node.text.trim()).length === 0
        ) {
          continue;
        }

        data.root.children.push({
          direction: 'ltr',
          format: 0,
          indent: 0,
          tag: TYPE_TO_TAG[block.type] || undefined,
          type: blockType,
          version: 1,
          children,
        });
      }
    }

    console.log('Writing file:', file);
    writeFile(file, data);
  }
}

(async () => {
  await main();
  process.exit(0);
})();
