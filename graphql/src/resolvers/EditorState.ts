import type { Resolvers } from 'types/graphql';

import prisma from '#/database';

import { resolveType } from './utils/helpers';

/** A node of a post's editor state, as Lexical saved it: the fields resolvers read */
export interface EditorNodeData {
  type?: string;
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
    image(data) {
      return prisma.mediaUpload.findUnique({
        where: { id: data.imageId },
        include: { crops: true },
      });
    },
  },
  VideoNode: {
    video(data) {
      return prisma.video.findUnique({ where: { id: data.videoId } });
    },
  },
} satisfies Resolvers;

export default resolvers;
