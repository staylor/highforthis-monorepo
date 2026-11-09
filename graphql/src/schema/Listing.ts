const Listing = `#graphql
  type Listing {
    sourceId: String!
    localDate: String
    localTime: String
    headliners: [String!]!
    support: [String!]!
    status: String
    cancelled: Boolean!
    url: String
    newArtists: [String!]!
    show: Show
    dateChanged: Boolean!
  }

  type VenueListings {
    source: String
    error: String
    listings: [Listing!]!
  }

  input ImportListingInput {
    sourceId: String!
    artists: [String!]!
  }

  type ImportListingsResult {
    artistsCreated: Int!
    showsCreated: Int!
  }

  extend type Query {
    venueListings(venueId: String!): VenueListings!
  }

  extend type Mutation {
    importListings(venueId: String!, input: [ImportListingInput!]!): ImportListingsResult!
  }
`;

export default Listing;
