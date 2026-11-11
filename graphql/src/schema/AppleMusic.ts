const AppleMusic = `#graphql
  type AppleMusicArtwork {
    width: Int
    height: Int
    url: String
    bgColor: String
    textColor1: String
    textColor2: String
    textColor3: String
    textColor4: String
  }

  type AppleMusicData {
    id: String
    url: String
    genreNames: [String!]
    artwork: AppleMusicArtwork
  }

  input AppleMusicArtworkInput {
    width: Int
    height: Int
    url: String
    bgColor: String
    textColor1: String
    textColor2: String
    textColor3: String
    textColor4: String
  }

  input AppleMusicDataInput {
    id: String
    url: String
    genreNames: [String!]
    artwork: AppleMusicArtworkInput
  }

  type AppleMusicAlbum {
    id: String!
    name: String!
    artistName: String!
    releaseDate: String
    url: String
    artwork: AppleMusicArtwork!
    # The cover, fitted within a square this many pixels wide
    cover(size: Int!): String!
  }

  type AppleMusicAlbumResults {
    albums: [AppleMusicAlbum!]!
    error: String
  }

  extend type Query {
    appleMusicAlbums(term: String!): AppleMusicAlbumResults!
  }

  extend type Mutation {
    # Adds the albums' full-size covers to the media library
    addAlbumCovers(ids: [String!]!): [MediaUpload!]!
  }
`;

export default AppleMusic;
