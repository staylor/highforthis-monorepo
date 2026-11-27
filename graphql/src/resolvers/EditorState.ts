import { inList } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { batchBy } from '#/database/batch';
import db from '#/database/db';
import { mediaDetails, mediaUploads, videos, videoThumbnailRows } from '#/database/tables';

import { resolveType } from './utils/helpers';

/** A node of a post's editor state, as Lexical saved it: the fields resolvers read */
export interface EditorNodeData {
  type?: string;
  imageId?: string;
  videoId?: string;
}

// A post's images load in one query, with their crops, instead of a query each and a query per
// image from ImageUpload.crops, and its videos in another
const loadImage = batchBy('id', (ids: string[]) =>
  db.findMany(mediaUploads, { where: inList('id', ids), with: { crops: mediaDetails.crops } })
);
const loadVideo = batchBy('id', (ids: string[]) =>
  db.findMany(videos, { where: inList('id', ids), with: { thumbnails: videoThumbnailRows } })
);

// Some older posts have media nodes saved without an id (videos that had gone, kept as an error
// message). Those load as no media.
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
    image(data) {
      if (!data.imageId) {
        return null;
      }
      return loadImage(data.imageId);
    },
  },
  VideoNode: {
    video(data) {
      if (!data.videoId) {
        return null;
      }
      return loadVideo(data.videoId);
    },
  },
} satisfies Resolvers;

export default resolvers;
