import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/components/Admin/Form/FeaturedMedia/index.graphql';

export const venueFormFragment = gql`
  fragment VenueForm_venue on Venue {
    capacity
    city
    coordinates {
      latitude
      longitude
    }
    description
    excludeFromSearch
    featuredMedia {
      ...FeaturedMedia_media
    }
    id
    listingsUrl
    name
    permanentlyClosed
    postalCode
    slug
    state
    streetAddress
    website
  }
  ${featuredMediaFragment}
`;
