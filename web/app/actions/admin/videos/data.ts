import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '@highforthis/shared/admin/forms';
import { addPageOffset, addSearchParam } from '@highforthis/shared/admin/listVariables';

import type { VideoEditQuery, VideosAdminQuery } from '../../../types/graphql.ts';

// The videos section's data, moved from the admin app's src/server/videos.ts with the same
// GraphQL operations.

const videoFormFragment = gql`
  fragment VideoForm_video on Video {
    dataPlaylistId
    dataType
    id
    slug
    thumbnails {
      height
      url
      width
    }
    title
    year
  }
`;

const videosQuery = gql`
  query VideosAdmin($after: String, $first: Int, $search: String, $year: Int) {
    videos(after: $after, first: $first, search: $search, year: $year) @cache(key: "admin") {
      count
      edges {
        node {
          id
          publishedAt
          slug
          title
          year
        }
      }
      pageInfo {
        hasNextPage
      }
      years
    }
  }
`;

const deleteVideoMutation = gql`
  mutation DeleteVideo($ids: [String]!) {
    removeVideo(ids: $ids)
  }
`;

const videoQuery = gql`
  query VideoEdit($id: String) {
    video(id: $id) {
      ...VideoForm_video
    }
  }
  ${videoFormFragment}
`;

const updateVideoMutation = gql`
  mutation UpdateVideo($id: String!, $input: UpdateVideoInput!) {
    updateVideo(id: $id, input: $input) {
      ...VideoForm_video
    }
  }
  ${videoFormFragment}
`;

// Keeps a title like "1999" a string, as with artists' and venues' names
const skipKeys = ['title', 'slug'];

/** The videos list, filtered by ?search= and ?year=. */
export function loadVideos({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  const year = Number(searchParams.get('year'));
  if (year) {
    variables.year = year;
  }
  return client.query<VideosAdminQuery>(videosQuery, variables);
}

export function deleteVideos(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteVideoMutation });
}

export function loadVideo({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<VideoEditQuery>(videoQuery, { id });
}

export function updateVideo({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updateVideoMutation, variables: { id }, skipKeys });
}
