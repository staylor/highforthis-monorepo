const Media = `#graphql
  interface MediaUpload {
    id: ObjID!
    title: String
    originalName: String!
    destination: String!
    fileName: String!
    mimeType: String!
    type: String!
    fileSize: Int!
  }

  type ImageUploadCrop {
    fileName: String!
    width: Int!
    height: Int!
    fileSize: Int!
  }

  input ImageUploadCropInput {
    fileName: String
    width: Int
    height: Int
    fileSize: Int
  }

  type ImageUpload implements MediaUpload {
    id: ObjID!
    title: String
    originalName: String!
    destination: String!
    fileName: String!
    mimeType: String!
    type: String!
    fileSize: Int!
    width: Int
    height: Int
    caption: String
    altText: String
    crops: [ImageUploadCrop!]!
  }

  type AudioUpload implements MediaUpload {
    id: ObjID!
    title: String
    description: String
    originalName: String!
    destination: String!
    fileName: String!
    mimeType: String!
    type: String!
    fileSize: Int!
    artist: [String]
    album: String
    albumArtist: [String]
    genre: [String]
    year: Int
    duration: Float
    images: [ImageUploadCrop]
  }

  type VideoUpload implements MediaUpload {
    id: ObjID!
    title: String
    description: String
    originalName: String!
    destination: String!
    fileName: String!
    mimeType: String!
    type: String!
    fileSize: Int!
    width: Int
    height: Int
    duration: Float
  }

  type FileUpload implements MediaUpload {
    id: ObjID!
    title: String
    description: String
    originalName: String!
    destination: String!
    fileName: String!
    mimeType: String!
    type: String!
    fileSize: Int!
  }

  type MediaUploadEdge {
    node: MediaUpload!
    cursor: String!
  }

  type MediaUploadConnection {
    types: [String!]
    mimeTypes: [String!]
    count: Int!
    edges: [MediaUploadEdge!]!
    pageInfo: PageInfo!
  }

  extend type Query {
    uploads(
      first: Int
      after: String
      last: Int
      before: String
      type: String
      mimeType: String
      search: String
    ): MediaUploadConnection
    media(id: ObjID): MediaUpload
  }

  input UpdateMediaUploadInput {
    title: String
    description: String
    # Image fields
    caption: String
    altText: String
  }

  extend type Mutation {
    updateMediaUpload(id: ObjID!, input: UpdateMediaUploadInput!): MediaUpload
    removeMediaUpload(ids: [ObjID]!): Boolean
  }
`;

export default Media;
