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

  input BulkCreateShowInput {
    artists: [String!]!
    attended: Boolean
    date: Float!
    venue: String!
  }

  type BulkCreateShowsResult {
    artistsCreated: Int!
    showsCreated: Int!
    venuesCreated: Int!
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
    # When the first and the latest of those shows were
    firstDate: Float!
    lastDate: Float!
    entity: ShowEntity!
  }

  # The shows we've been to, all told
  type ShowTotals {
    shows: Int!
    artists: Int!
    venues: Int!
    firstDate: Float
    lastDate: Float
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
      # The shows to come, soonest first. Today's stay listed until the day is over in New York.
      latest: Boolean
      attended: Boolean
      year: Int
      # With no year, only the shows in the newest one's year, the first of the connection's years
      mostRecentYear: Boolean
      artist: EntityArg
      venue: EntityArg
      search: String
      order: ShowOrder
    ): ShowConnection
    show(id: String, lastAdded: Boolean): Show
    # The artists or venues we've seen the most, most first, and only the first so many if asked
    showStats(entity: ShowEntityType!, first: Int): [ShowStat!]!
    showTotals: ShowTotals!
  }

  extend type Mutation {
    bulkCreateShows(input: [BulkCreateShowInput!]!): BulkCreateShowsResult!
    createShow(input: CreateShowInput!): Show
    updateShow(id: String!, input: UpdateShowInput!): Show
    removeShow(ids: [String]!): Boolean
  }
`;

export default Show;
