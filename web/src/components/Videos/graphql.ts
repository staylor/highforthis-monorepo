import { gql } from 'graphql-tag';

import Video from './Video';

export const videosQuery = gql`
  fragment Videos_videos on Query {
    videos(after: $after, before: $before, first: $first, last: $last, year: $year)
      @cache(key: $cacheKey) {
      edges {
        cursor
        node {
          ...Video_video
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${Video.fragments.video}
`;
