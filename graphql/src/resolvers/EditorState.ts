import type { AppContext } from '~/models';

const resolvers = {
  EditorNode: {
    __resolveType(node: any) {
      if (node.type === 'code') return 'CodeNode';
      if (node.type === 'heading') return 'HeadingNode';
      if (node.type === 'image') return 'ImageNode';
      if (node.type === 'linebreak') return 'LinebreakNode';
      if (node.type === 'list') return 'ListNode';
      if (node.type === 'quote') return 'QuoteNode';
      if (node.type === 'text') return 'TextNode';
      if (node.type === 'video') return 'VideoNode';
      return 'ElementNode';
    },
  },
  ImageNode: {
    image(data: any, _: unknown, { prisma }: AppContext) {
      return prisma.mediaUpload.findUnique({ where: { id: data.imageId } });
    },
  },
  VideoNode: {
    video(data: any, _: unknown, { prisma }: AppContext) {
      return prisma.video.findUnique({ where: { id: data.videoId } });
    },
  },
};

export default resolvers;
