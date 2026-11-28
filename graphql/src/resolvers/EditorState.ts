import { inList } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { requireAdmin } from '#/authorization';
import { batchBy } from '#/database/batch';
import db from '#/database/db';
import { mediaDetails, mediaUploads, videos, videoThumbnailRows } from '#/database/tables';

import { resolveType } from './utils/helpers';

/** A node of a post's editor state, as Lexical saved it: the fields resolvers read */
export interface EditorNodeData {
  children?: EditorNodeData[] | null;
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

/** Preserve the entire Lexical tree for editing, including deeply nested lists. */
async function forEditing(node: EditorNodeData): Promise<object> {
  if (node.type === 'image') {
    const row = node.imageId ? await loadImage(node.imageId) : null;
    const image = row && {
      id: row.id,
      destination: row.destination,
      crops: row.crops.map(({ fileName, width }) => ({ fileName, width })),
    };
    return { ...node, image };
  }
  if (node.type === 'video') {
    const row = node.videoId ? await loadVideo(node.videoId) : null;
    const video = row && {
      id: row.id,
      dataId: row.dataId,
      title: row.title,
      slug: row.slug,
      thumbnails: row.thumbnails.map(({ url, width, height }) => ({ url, width, height })),
    };
    return { ...node, video };
  }
  return node.children
    ? { ...node, children: await Promise.all(node.children.map(forEditing)) }
    : node;
}

// Some older posts have media nodes saved without an id (videos that had gone, kept as an error
// message). Those load as no media.
const resolvers = {
  EditorState: {
    forEditing: requireAdmin(async ({ root }) =>
      JSON.stringify({ root: root ? await forEditing(root) : null })
    ),
  },
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
