import type { OperationVariables } from '@apollo/client';
import Video from '@highforthis/shared/web/components/Videos/Video';
import type { VideoModalQuery } from '@highforthis/shared/web/types/graphql';
import query from '@highforthis/shared/web/utils/query';
import { gql } from 'graphql-tag';

import type { Route } from './+types/video';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const variables = { first: 50 } as OperationVariables;
  if (params.cursor) {
    variables.cursor = params.cursor;
  }
  return query<VideoModalQuery>({ request, context, query: videosQuery, variables });
}

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
  ${Video.fragments.video},
`;
