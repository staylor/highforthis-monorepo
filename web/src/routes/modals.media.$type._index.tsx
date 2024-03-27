import type { OperationVariables } from '@apollo/client';
import { gql } from 'graphql-tag';
import type { LoaderFunction } from '@remix-run/server-runtime';

import query from '@/utils/query';

export const loader: LoaderFunction = ({ context, params }) => {
  const variables = { first: 50 } as OperationVariables;
  if (params.type) {
    variables.type = params.type;
  }
  if (params.cursor) {
    variables.cursor = params.cursor;
  }
  return query({ context, query: uploadsQuery, variables });
};

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
