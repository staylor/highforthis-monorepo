const Term = `#graphql      
  interface Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    taxonomy: Taxonomy!
    featuredMedia: [MediaUpload!]
  }

  type Artist implements Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    appleMusic: AppleMusicData
    taxonomy: Taxonomy!
    featuredMedia: [MediaUpload!]
  }

  type VenueCoordinates {
    latitude: Float
    longitude: Float
  }

  type Venue implements Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    taxonomy: Taxonomy!
    capacity: String
    address: String
    coordinates: VenueCoordinates
    featuredMedia: [MediaUpload!]
  }

  type TermEdge {
    node: Term!
    cursor: String!
  }

  type TermConnection {
    taxonomy: Taxonomy!
    count: Int!
    edges: [TermEdge!]!
    pageInfo: PageInfo!
  }

  input CreateTermInput {
    name: String!
    slug: String
    description: String
    taxonomy: ObjID!
    featuredMedia: [String]
    # Venue
    address: String
    capacity: String
  }

  input VenueCoordinatesInput {
    latitude: Float!
    longitude: Float!
  }

  input UpdateTermInput {
    name: String
    slug: String
    description: String
    taxonomy: ObjID
    featuredMedia: [String]
    # Artist
    appleMusic: AppleMusicDataInput
    # Venue
    address: String
    capacity: String
    coordinates: VenueCoordinatesInput
  }

  extend type Query {
    terms(
      first: Int
      after: String
      last: Int
      before: String
      taxonomyId: ObjID
      taxonomy: String
      search: String
    ): TermConnection
    term(id: ObjID, slug: String, taxonomy: String): Term
  }

  extend type Mutation {
    createTerm(input: CreateTermInput!): Term
    updateTerm(id: ObjID!, input: UpdateTermInput!): Term
    removeTerm(ids: [ObjID]!): Boolean
  }
`;

export default Term;
