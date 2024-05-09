const Show = `#graphql      
  type Show {
    id: ObjID!
    title: String
    notes: String
    date: Float!
    url: String
    attended: Boolean
    artists: [Artist!]!
    venue: Venue!
  }

  type ShowEdge {
    node: Show!
    cursor: String!
  }

  type ShowConnection {
    count: Int
    edges: [ShowEdge!]!
    pageInfo: PageInfo!
  }

  input CreateShowInput {
    title: String
    notes: String
    date: Float!
    url: String
    attended: Boolean
    artists: [ObjID!]!
    venue: ObjID!
  }

  input UpdateShowInput {
    title: String
    notes: String
    date: Float
    url: String
    attended: Boolean
    artists: [ObjID]
    venue: ObjID
  }

  enum ShowOrder {
    ASC
    DESC
  }

  enum ShowEntityType {
    ARTIST
    VENUE
  }

  union ShowEntity = Artist | Venue

  type ShowStat {
    count: Int!
    entity: ShowEntity!
  }

  extend type Query {
    shows(
      first: Int
      after: String
      last: Int
      before: String
      latest: Boolean
      attended: Boolean
      date: Float
      artistId: ObjID
      artistSlug: String
      venueId: ObjID
      venueSlug: String
      search: String
      order: ShowOrder
    ): ShowConnection
    show(id: ObjID, slug: String): Show
    showStats(entity: ShowEntityType!): [ShowStat!]! 
  }

  extend type Mutation {
    createShow(input: CreateShowInput!): Show
    updateShow(id: ObjID!, input: UpdateShowInput!): Show
    removeShow(ids: [ObjID]!): Boolean
  }
`;

export default Show;
