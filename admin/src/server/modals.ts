import type { OperationVariables } from '@apollo/client';
import { gql } from 'graphql-tag';

import { videoFragment } from '#/components/Videos/Video.graphql';
import type { MediaModalQuery, VideoModalQuery } from '#/types/graphql';

import type { GraphQLClient } from './graphql';

// The pages of media and videos that the editor's pickers scroll through

const PAGE_SIZE = 50;

const mediaQuery = gql`
  query MediaModal($cursor: String, $first: Int, $type: String) {
    uploads(after: $cursor, first: $first, type: $type) @cache(key: "modal") {
      edges {
        node {
          destination
          fileName
          id
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
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const videosQuery = gql`
  query VideoModal($cursor: String, $first: Int) {
    videos(after: $cursor, first: $first) @cache(key: "modal") {
      edges {
        node {
          ...Video_video
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${videoFragment}
`;

export function loadMediaModal({
  gql,
  type,
  cursor,
}: {
  gql: GraphQLClient;
  type?: string;
  cursor?: string;
}) {
  const variables: OperationVariables = { first: PAGE_SIZE };
  if (type) {
    variables.type = type;
  }
  if (cursor) {
    variables.cursor = cursor;
  }
  return gql.query<MediaModalQuery>(mediaQuery, variables);
}

export function loadVideoModal({ gql, cursor }: { gql: GraphQLClient; cursor?: string }) {
  const variables: OperationVariables = { first: PAGE_SIZE };
  if (cursor) {
    variables.cursor = cursor;
  }
  return gql.query<VideoModalQuery>(videosQuery, variables);
}
