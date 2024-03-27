const Podcast = `#graphql  
  type Podcast {
    id: ObjID!
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
    image: ObjID
    audio: ObjID
    date: Float
  }

  input UpdatePodcastInput {
    title: String!
    description: String
    image: ObjID
    audio: ObjID
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
    podcast(id: ObjID, slug: String): Podcast
  }

  extend type Mutation {
    createPodcast(input: CreatePodcastInput!): Podcast
    updatePodcast(id: ObjID!, input: UpdatePodcastInput!): Podcast
    removePodcast(ids: [ObjID]!): Boolean
  }
`;

export default Podcast;
