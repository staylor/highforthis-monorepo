import prisma from '#/database';

import { resolveType } from './utils/helpers';

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
    image(data: any) {
      return prisma.mediaUpload.findUnique({ where: { id: data.imageId } });
    },
  },
  VideoNode: {
    video(data: any) {
      return prisma.video.findUnique({ where: { id: data.videoId } });
    },
  },
};

export default resolvers;
