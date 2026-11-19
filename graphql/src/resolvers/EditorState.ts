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
        listitem: 'ListItemNode',
        quote: 'QuoteNode',
        // a tab is a TextNode holding "\t"
        tab: 'TextNode',
        text: 'TextNode',
        video: 'VideoNode',
      },
      'ElementNode'
    ),
  },
  ImageNode: {
    // Prisma batches the findUnique calls of one tick into one query, and the crops come with
    // it, instead of a query per image from ImageUpload.crops
    image(data: EditorNodeData) {
      return prisma.mediaUpload.findUnique({
        where: { id: data.imageId },
        include: { crops: true },
      });
    },
  },
  VideoNode: {
    video(data: EditorNodeData) {
      return prisma.video.findUnique({ where: { id: data.videoId } });
    },
  },
};

export default resolvers;
