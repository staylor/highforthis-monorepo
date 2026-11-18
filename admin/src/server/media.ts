import { gql } from 'graphql-tag';

import { mediaFormFragment } from '#/components/Admin/Media/Form.graphql';
import type {
  AddAlbumCoversMutation,
  AlbumCoversAdminQuery,
  MediaAdminQuery,
  UploadsAdminQuery,
} from '#/types/graphql';
import { addPageOffset } from '#/utils/listVariables';

import { deleteSelected, submitForm, type FormArgs, type RedirectResult } from './forms';
import type { GraphQLClient } from './graphql';

const uploadsQuery = gql`
  query UploadsAdmin(
    $after: String
    $first: Int
    $mimeType: String
    $search: String
    $type: String
  ) {
    uploads(after: $after, first: $first, mimeType: $mimeType, search: $search, type: $type)
      @cache(key: "admin") {
      count
      edges {
        node {
          destination
          id
          mimeType
          originalName
          title
          type
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
      mimeTypes
      pageInfo {
        hasNextPage
      }
      types
    }
  }
`;

const deleteMediaMutation = gql`
  mutation DeleteMedia($ids: [String]!) {
    removeMediaUpload(ids: $ids)
  }
`;

const mediaQuery = gql`
  query MediaAdmin($id: String!) {
    media(id: $id) {
      ...MediaForm_media
    }
  }
  ${mediaFormFragment}
`;

const updateMediaMutation = gql`
  mutation UpdateMedia($id: String!, $input: UpdateMediaUploadInput!) {
    updateMediaUpload(id: $id, input: $input) {
      ...MediaForm_media
    }
  }
  ${mediaFormFragment}
`;

const albumsQuery = gql`
  query AlbumCoversAdmin($term: String!) {
    appleMusicAlbums(term: $term) {
      albums {
        id
        name
        artistName
        releaseDate
        cover(size: 600)
        artwork {
          width
          height
        }
      }
      error
    }
  }
`;

const addAlbumCoversMutation = gql`
  mutation AddAlbumCovers($ids: [String!]!) {
    addAlbumCovers(ids: $ids) {
      id
    }
  }
`;

// The media list, filtered by ?type=, ?mimeType= and ?search=
export function loadMediaList({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addPageOffset(searchParams);
  ['type', 'mimeType', 'search'].forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      variables[key] = value;
    }
  });
  return gql.query<UploadsAdminQuery>(uploadsQuery, variables);
}

export function deleteMedia(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteMediaMutation });
}

export function loadMedia({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<MediaAdminQuery>(mediaQuery, { id });
}

export function updateMedia({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updateMediaMutation, variables: { id } });
}

// Searches Apple Music for albums by ?search=; without a search there's nothing to show yet
export async function searchAlbumCovers({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const term = searchParams.get('search')?.trim();
  if (!term) {
    return { appleMusicAlbums: null };
  }
  return gql.query<AlbumCoversAdminQuery>(albumsQuery, { term });
}

// Adds the checked albums' covers to the media library
export async function addAlbumCovers({
  gql,
  formData,
}: {
  gql: GraphQLClient;
  formData: FormData;
}): Promise<{ failed: true } | RedirectResult> {
  const ids = formData.getAll('selected').map(String);
  const result = await gql.mutate<Partial<AddAlbumCoversMutation>>(addAlbumCoversMutation, {
    ids,
  });
  const added = result.addAlbumCovers;
  if (!added) {
    return { failed: true };
  }
  return { redirectTo: `/admin/media?added=${added.length}` };
}
