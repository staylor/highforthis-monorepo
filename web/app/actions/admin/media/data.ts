import { gql } from 'graphql-tag';

import type { GraphQLClient } from '#/lib/admin/forms.ts';
import type {
  FeaturedMedia_MediaFragment,
  MediaPickerQuery,
  VideoPickerQuery,
} from '#/types/graphql.ts';
import type { SelectedMedia } from '#/ui/admin/public/featured-media.tsx';
import type { MediaPickerItem } from '#/ui/admin/public/picker-dialog.tsx';
import { uploadUrl } from '#/ui/public/media.ts';

// The browser gets URLs it can show, not the uploads themselves.

/** What a form's query asks for to fill its featured media field. */
export const featuredMediaFragment = gql`
  fragment FeaturedMedia_media on MediaUpload {
    destination
    fileName
    id
    type
    ... on ImageUpload {
      crops {
        fileName
        width
      }
    }
  }
`;

const mediaPickerQuery = gql`
  query MediaPicker($cursor: String, $first: Int, $type: String) {
    uploads(after: $cursor, first: $first, type: $type) @cache(key: "modal") {
      edges {
        node {
          destination
          fileName
          id
          title
          ... on ImageUpload {
            crops {
              fileName
              width
            }
          }
          ... on AudioUpload {
            images {
              fileName
              width
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const videoPickerQuery = gql`
  query VideoPicker($cursor: String, $first: Int) {
    videos(after: $cursor, first: $first) @cache(key: "modal") {
      edges {
        node {
          dataId
          id
          slug
          thumbnails {
            height
            url
            width
          }
          title
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const PAGE_SIZE = 50;

interface Crop {
  fileName: string;
  width: number;
}

const cropUrl = (
  destination: string,
  crops: ReadonlyArray<Crop | null> | null | undefined,
  width: number
) => {
  const crop = crops?.find((c) => c?.width === width);
  return crop ? uploadUrl(destination, crop.fileName) : null;
};

export function selectedMedia(
  media: ReadonlyArray<FeaturedMedia_MediaFragment | null> | null | undefined
): SelectedMedia[] {
  return (media ?? []).filter(Boolean).map((upload) => ({
    id: upload!.id,
    preview: 'crops' in upload! ? cropUrl(upload!.destination, upload!.crops, 300) : null,
    audio: upload!.type === 'audio' ? uploadUrl(upload!.destination, upload!.fileName) : null,
  }));
}

interface MediaPickerPage {
  items: MediaPickerItem[];
  endCursor: string | null;
  hasNextPage: boolean;
}

/**
 * A page of uploads of one type for the picker: 150px thumbnails, and what the field shows once
 * one is picked, its 300px crop or, for audio, the file to play.
 */
export async function loadMediaPickerPage({
  gql: client,
  type,
  cursor,
}: {
  gql: GraphQLClient;
  type: string;
  cursor?: string | null;
}): Promise<MediaPickerPage> {
  if (type === 'video') {
    return loadVideoPickerPage({ gql: client, cursor });
  }
  const { uploads } = await client.query<MediaPickerQuery>(mediaPickerQuery, {
    first: PAGE_SIZE,
    type,
    ...(cursor ? { cursor } : {}),
  });
  const items = (uploads?.edges ?? []).map(({ node }) => {
    const crops = 'crops' in node ? node.crops : 'images' in node ? node.images : null;
    return {
      id: node.id,
      title: node.title ?? '',
      thumb: cropUrl(node.destination, crops, 150),
      preview: cropUrl(node.destination, crops, 300),
      audio: 'images' in node ? uploadUrl(node.destination, node.fileName) : null,
      // What the post editor's image block keeps
      image:
        'crops' in node
          ? {
              id: node.id,
              destination: node.destination,
              crops: node.crops.filter(Boolean).map((crop) => ({
                fileName: crop!.fileName,
                width: crop!.width,
              })),
            }
          : null,
    };
  });
  return {
    items,
    endCursor: uploads?.pageInfo.endCursor ?? null,
    hasNextPage: Boolean(uploads?.pageInfo.hasNextPage),
  };
}

/** A page of videos for the post editor's video block, with their 120px thumbnails. */
async function loadVideoPickerPage({
  gql: client,
  cursor,
}: {
  gql: GraphQLClient;
  cursor?: string | null;
}): Promise<MediaPickerPage> {
  const { videos } = await client.query<VideoPickerQuery>(videoPickerQuery, {
    first: PAGE_SIZE,
    ...(cursor ? { cursor } : {}),
  });
  const items = (videos?.edges ?? []).map(({ node }) => ({
    id: node.id,
    title: node.title,
    thumb: node.thumbnails.find((thumb) => thumb.width === 120)?.url ?? null,
    preview: null,
    video: {
      id: node.id,
      dataId: node.dataId,
      slug: node.slug,
      title: node.title,
      thumbnails: node.thumbnails.map(({ url, width, height }) => ({ url, width, height })),
    },
  }));
  return {
    items,
    endCursor: videos?.pageInfo.endCursor ?? null,
    hasNextPage: Boolean(videos?.pageInfo.hasNextPage),
  };
}
