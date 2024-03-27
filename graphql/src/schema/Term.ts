const Term = `#graphql      
  interface Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    taxonomy: Taxonomy!
    featuredMedia: [MediaUpload!]
  }

  type Category implements Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    taxonomy: Taxonomy!
    featuredMedia: [MediaUpload!]
  }

  type CrossStreet implements Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    taxonomy: Taxonomy!
    featuredMedia: [MediaUpload!]
  }

  type Neighborhood implements Term {
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

  type Place implements Term {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    taxonomy: Taxonomy!
    address: String
    neighborhood: Neighborhood
    categories: [Category!]!
    crossStreets: [CrossStreet!]!
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
    # Place, Venue
    address: String
    # Venue
    capacity: String
    # Place
    neighborhood: ObjID
    categories: [String]
    crossStreets: [String]
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
    # Place, Venue
    address: String
    # Venue
    capacity: String
    coordinates: VenueCoordinatesInput
    # Place
    neighborhood: ObjID
    categories: [String]
    crossStreets: [String]
  }

  enum PlaceOrder {
    UPDATED_ASC
    UPDATED_DESC
    A_TO_Z
    Z_TO_A
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
    places(
      first: Int
      after: String
      last: Int
      before: String
      neighborhoods: [String]
      categories: [String]
      crossStreets: [String]
      search: String
      order: PlaceOrder
    ): TermConnection
  }

  extend type Mutation {
    createTerm(input: CreateTermInput!): Term
    updateTerm(id: ObjID!, input: UpdateTermInput!): Term
    removeTerm(ids: [ObjID]!): Boolean
  }
`;

export default Term;
