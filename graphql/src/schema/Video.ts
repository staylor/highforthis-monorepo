const Video = `#graphql      
  type Video {
    id: String!
    dataId: String!
    slug: String!
    dataType: String!
    dataPlaylistId: String!
    year: Int!
    publishedAt: Float!
    publishedISO: String!
    title: String!
    thumbnails: [VideoThumbnail!]!
    position: Int!
    createdAt: Float!
    updatedAt: Float!
  }

  type VideoThumbnail {
    url: String!
    width: Int!
    height: Int!
  }

  type VideoEdge {
    node: Video!
    cursor: String!
  }

  type VideoConnection {
    years: [Int!]
    count: Int!
    edges: [VideoEdge!]!
    pageInfo: PageInfo!
  }

  input CreateVideoInput {
    dataId: String
    slug: String!
    dataType: String
    dataPlaylistId: String
    year: Int!
    publishedAt: Float!
    publishedISO: String
    title: String!
    position: Int
  }

  input UpdateVideoInput {
    dataId: String
    slug: String
    dataType: String
    dataPlaylistId: String
    year: Int
    publishedAt: Float
    publishedISO: String
    title: String
    position: Int
  }

  extend type Query {
    videos(
      first: Int
      after: String
      last: Int
      before: String
      year: Int
      search: String
    ): VideoConnection
    video(id: String, slug: String): Video
  }

  extend type Mutation {
    createVideo(input: CreateVideoInput!): Video
    updateVideo(id: String!, input: UpdateVideoInput!): Video
    removeVideo(ids: [String]!): Boolean
  }
`;

export default Video;
