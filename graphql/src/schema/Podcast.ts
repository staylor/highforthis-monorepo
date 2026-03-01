const Podcast = `#graphql  
  type Podcast {
    id: String!
    title: String!
    description: String!
    image: ImageUpload
    audio: AudioUpload
    date: Float
  }

  type PodcastEdge {
    node: Podcast!
    cursor: String!
  }

  type PodcastConnection {
    count: Int!
    edges: [PodcastEdge!]!
    pageInfo: PageInfo!
  }

  input CreatePodcastInput {
    title: String!
    description: String
    image: String
    audio: String
    date: Float
  }

  input UpdatePodcastInput {
    title: String!
    description: String
    image: String
    audio: String
    date: Float
  }

  enum PodcastOrder {
    ASC
    DESC
  }

  extend type Query {
    podcasts(
      first: Int
      after: String
      last: Int
      before: String
      search: String
      order: PodcastOrder
    ): PodcastConnection
    podcast(id: String, slug: String): Podcast
  }

  extend type Mutation {
    createPodcast(input: CreatePodcastInput!): Podcast
    updatePodcast(id: String!, input: UpdatePodcastInput!): Podcast
    removePodcast(ids: [String]!): Boolean
  }
`;

export default Podcast;
