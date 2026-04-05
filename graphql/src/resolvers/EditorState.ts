import prisma from '#/database';

import { resolveType } from './utils/helpers';

interface EditorNodeData {
  imageId?: string;
  videoId?: string;
}

const resolvers = {
  EditorNode: {
    __resolveType: resolveType(
      {
        code: 'CodeNode',
        heading: 'HeadingNode',
        image: 'ImageNode',
        linebreak: 'LinebreakNode',
        list: 'ListNode',
        quote: 'QuoteNode',
        text: 'TextNode',
        video: 'VideoNode',
      },
      'ElementNode'
    ),
  },
  ImageNode: {
    image(data: EditorNodeData) {
      return prisma.mediaUpload.findUnique({ where: { id: data.imageId } });
    },
  },
  VideoNode: {
    video(data: EditorNodeData) {
      return prisma.video.findUnique({ where: { id: data.videoId } });
    },
  },
};

export default resolvers;
