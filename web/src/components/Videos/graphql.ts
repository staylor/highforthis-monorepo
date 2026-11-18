import Video from '@highforthis/shared/web/components/Videos/Video';
import { gql } from 'graphql-tag';

export const videosQuery = gql`
  fragment Videos_videos on Query {
    videos(after: $after, before: $before, first: $first, last: $last, year: $year)
      @cache(key: $cacheKey) {
      count
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
