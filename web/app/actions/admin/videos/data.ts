import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '#/lib/admin/list-variables.ts';
import type { VideoEditQuery, VideosAdminQuery } from '#/types/graphql.ts';

const videoFormFragment = gql`
  fragment VideoForm_video on Video {
    id
    dataPlaylistId
    dataType
    slug
    title
    year
    thumbnails {
      height
      url
      width
    }
  }
`;

const videosQuery = gql`
  query VideosAdmin($after: String, $first: Int, $search: String, $year: Int) {
    videos(after: $after, first: $first, search: $search, year: $year) {
      count
      years
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

const textFields = ['title', 'slug', 'dataType'];

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
  return submitForm({ ...args, mutation: updateVideoMutation, variables: { id }, textFields });
}
