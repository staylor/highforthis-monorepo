import type { OperationVariables } from '@apollo/client';
import { gql } from 'graphql-tag';

import type { MediaModalQuery } from '~/types/graphql';
import query from '~/utils/query';

import type { Route } from './+types/media';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const variables = { first: 50 } as OperationVariables;
  if (params.type) {
    variables.type = params.type;
  }
  if (params.cursor) {
    variables.cursor = params.cursor;
  }
  return query<MediaModalQuery>({ request, context, query: uploadsQuery, variables });
}

const uploadsQuery = gql`
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
