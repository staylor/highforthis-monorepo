import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/components/Admin/Form/FeaturedMedia/index.graphql';

export const artistFormFragment = gql`
  fragment ArtistForm_artist on Artist {
    appleMusic {
      artwork {
        url
      }
      id
    }
    description
    excludeFromSearch
    featuredMedia {
      ...FeaturedMedia_media
    }
    id
    name
    slug
    website
  }
  ${featuredMediaFragment}
`;
