const Show = `#graphql      
  type Show {
    id: String!
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
    years: [Int!]
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
    artists: [String!]!
    venue: String!
  }

  input UpdateShowInput {
    title: String
    notes: String
    date: Float
    url: String
    attended: Boolean
    artists: [String]
    venue: String
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

  input EntityArg {
    id: String
    slug: String
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
      year: Int
      artist: EntityArg
      venue: EntityArg
      search: String
      order: ShowOrder
    ): ShowConnection
    show(id: String, slug: String, lastAdded: Boolean): Show
    showStats(entity: ShowEntityType!): [ShowStat!]! 
  }

  extend type Mutation {
    createShow(input: CreateShowInput!): Show
    updateShow(id: String!, input: UpdateShowInput!): Show
    removeShow(ids: [String]!): Boolean
  }
`;

export default Show;
