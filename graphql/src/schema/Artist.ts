const Artist = `#graphql      
  type Artist {
    id: ObjID!
    name: String!
    slug: String!
    description: String
    appleMusic: AppleMusicData
    featuredMedia: [MediaUpload!]
    website: String
    excludeFromSearch: Boolean
  }

  type ArtistEdge {
    node: Artist!
    cursor: String!
  }

  type ArtistConnection {
    count: Int!
    edges: [ArtistEdge!]!
    pageInfo: PageInfo!
  }

  input CreateArtistInput {
    name: String!
    slug: String
    description: String
    featuredMedia: [String]
    website: String
    excludeFromSearch: Boolean
  }

  input UpdateArtistInput {
    name: String
    slug: String
    description: String
    featuredMedia: [String]
    website: String
    appleMusic: AppleMusicDataInput
    excludeFromSearch: Boolean
  }

  extend type Query {
    artists(
      first: Int
      after: String
      last: Int
      before: String
      search: String
      filtered: Boolean
    ): ArtistConnection
    artist(id: ObjID, slug: String): Artist
  }

  extend type Mutation {
    createArtist(input: CreateArtistInput!): Artist
    updateArtist(id: ObjID!, input: UpdateArtistInput!): Artist
    removeArtist(ids: [ObjID]!): Boolean
  }
`;

export default Artist;
