import { gql } from 'graphql-tag';

import type { GraphQLClient } from '@highforthis/shared/admin/forms';

import { uploadUrl } from '../../../lib/media.ts';
import type { FeaturedMedia_MediaFragment, MediaPickerQuery } from '../../../types/graphql.ts';
import type { MediaPickerItem, SelectedMedia } from '../../../ui/admin/public/featured-media.tsx';

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
    };
  });
  return {
    items,
    endCursor: uploads?.pageInfo.endCursor ?? null,
    hasNextPage: Boolean(uploads?.pageInfo.hasNextPage),
  };
}
