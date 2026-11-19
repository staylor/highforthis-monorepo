import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
  type RedirectResult,
} from '@highforthis/shared/admin/forms';
import { addPageOffset } from '@highforthis/shared/admin/listVariables';

import type {
  AddAlbumCoversMutation,
  AlbumCoversAdminQuery,
  MediaAdminQuery,
  UploadsAdminQuery,
} from '../../../types/graphql.ts';

// The featured media field's picker has its own data, in data.ts.

const mediaFormFragment = gql`
  fragment MediaForm_media on MediaUpload {
    destination
    fileName
    fileSize
    id
    mimeType
    originalName
    title
    type
    ... on ImageUpload {
      altText
      caption
      crops {
        fileName
        fileSize
        height
        width
      }
      height
      width
    }
    ... on AudioUpload {
      description
      duration
      images {
        fileName
        fileSize
        height
        width
      }
    }
    ... on VideoUpload {
      description
      duration
      height
      width
    }
    ... on FileUpload {
      description
    }
  }
`;

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

export function loadMediaList({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addPageOffset(searchParams);
  for (const key of ['type', 'mimeType', 'search']) {
    const value = searchParams.get(key);
    if (value) {
      variables[key] = value;
    }
  }
  return client.query<UploadsAdminQuery>(uploadsQuery, variables);
}

export function deleteMedia(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteMediaMutation });
}

export function loadMedia({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<MediaAdminQuery>(mediaQuery, { id });
}

export function updateMedia({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateMediaMutation,
    variables: { id },
    // Text fields stay strings, such as a title of "2024", and emptying one clears it
    skipKeys: ['title', 'description', 'caption', 'altText'],
  });
}

/** Searches Apple Music for albums by ?search=. Without a search there's nothing to show yet. */
export async function searchAlbumCovers({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}): Promise<{ appleMusicAlbums?: AlbumCoversAdminQuery['appleMusicAlbums'] | null }> {
  const term = searchParams.get('search')?.trim();
  if (!term) {
    return { appleMusicAlbums: null };
  }
  return client.query<AlbumCoversAdminQuery>(albumsQuery, { term });
}

/** Adds the checked albums' covers to the media library. */
export async function addAlbumCovers({
  gql: client,
  formData,
}: {
  gql: GraphQLClient;
  formData: FormData;
}): Promise<{ failed: true } | RedirectResult> {
  const ids = formData.getAll('selected').map(String);
  const result = await client.mutate<Partial<AddAlbumCoversMutation>>(addAlbumCoversMutation, {
    ids,
  });
  const added = result.addAlbumCovers;
  if (!added) {
    return { failed: true };
  }
  return { redirectTo: `/admin/media?added=${added.length}` };
}
