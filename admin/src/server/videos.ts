import { gql } from 'graphql-tag';

import { videoFormFragment } from '#/components/Admin/Video/Form.graphql';
import type { VideoEditQuery, VideosAdminQuery } from '#/types/graphql';
import { addPageOffset } from '#/utils/listVariables';

import { deleteSelected, submitForm, type FormArgs } from './forms';
import type { GraphQLClient } from './graphql';

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

// The videos list, filtered by ?search= and ?year=
export function loadVideos({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addPageOffset(searchParams);
  ['search', 'year'].forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      variables[key] = key === 'year' ? Number(value) : value;
    }
  });
  return gql.query<VideosAdminQuery>(videosQuery, variables);
}

export function deleteVideos(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteVideoMutation });
}

export function loadVideo({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<VideoEditQuery>(videoQuery, { id });
}

export function updateVideo({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updateVideoMutation, variables: { id } });
}
