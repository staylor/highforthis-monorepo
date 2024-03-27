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
`;

export default AppleMusic;
