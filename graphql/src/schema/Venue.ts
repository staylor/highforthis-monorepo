const Venue = `#graphql      
  type VenueCoordinates {
    latitude: Float
    longitude: Float
  }

  type Venue {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    capacity: String
    address: String
    streetAddress: String
    city: String
    state: String
    postalCode: String
    coordinates: VenueCoordinates
    featuredMedia: [MediaUpload!]
    website: String
    excludeFromSearch: Boolean
    permanentlyClosed: Boolean
  }

  type VenueEdge {
    node: Venue!
    cursor: String!
  }

  type VenueConnection {
    count: Int!
    edges: [VenueEdge!]!
    pageInfo: PageInfo!
  }

  input CreateVenueInput {
    name: String!
    slug: String
    description: String
    featuredMedia: [String]
    website: String
    streetAddress: String
    city: String
    state: String
    postalCode: String
    capacity: String
    coordinates: VenueCoordinatesInput
    excludeFromSearch: Boolean
    permanentlyClosed: Boolean
  }

  input VenueCoordinatesInput {
    latitude: Float
    longitude: Float
  }

  input UpdateVenueInput {
    name: String
    slug: String
    description: String
    featuredMedia: [String]
    website: String
    streetAddress: String
    city: String
    state: String
    postalCode: String
    capacity: String
    coordinates: VenueCoordinatesInput
    excludeFromSearch: Boolean
    permanentlyClosed: Boolean
  }

  extend type Query {
    venues(
      first: Int
      after: String
      last: Int
      before: String
      search: String
      filtered: Boolean
    ): VenueConnection
    venue(id: ObjID, slug: String): Venue
  }

  extend type Mutation {
    createVenue(input: CreateVenueInput!): Venue
    updateVenue(id: ObjID!, input: UpdateVenueInput!): Venue
    removeVenue(ids: [ObjID]!): Boolean
  }
`;

export default Venue;
