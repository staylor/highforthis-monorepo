import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/components/Admin/Form/FeaturedMedia/index.graphql';

export const podcastFormFragment = gql`
  fragment PodcastForm_podcast on Podcast {
    audio {
      ...FeaturedMedia_media
      id
    }
    description
    id
    image {
      ...FeaturedMedia_media
      id
    }
    title
  }
  ${featuredMediaFragment}
`;
