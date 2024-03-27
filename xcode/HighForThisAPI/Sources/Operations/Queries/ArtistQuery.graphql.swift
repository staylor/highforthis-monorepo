// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ArtistQuery: GraphQLQuery {
  public static let operationName: String = "Artist"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Artist($slug: String!) { artist: term(slug: $slug, taxonomy: "artist") { __typename id name slug ... on Artist { appleMusic { __typename artwork { __typename url width height } id url } } } shows(latest: true, first: 200, term: $slug, taxonomy: "artist") { __typename edges { __typename node { __typename id title date artist { __typename id name } venue { __typename id name } } } } }"#
    ))

  public var slug: String

  public init(slug: String) {
    self.slug = slug
  }

  public var __variables: Variables? { ["slug": slug] }

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("term", alias: "artist", Artist?.self, arguments: [
        "slug": .variable("slug"),
        "taxonomy": "artist"
      ]),
      .field("shows", Shows?.self, arguments: [
        "latest": true,
        "first": 200,
        "term": .variable("slug"),
        "taxonomy": "artist"
      ]),
    ] }

    public var artist: Artist? { __data["artist"] }
    public var shows: Shows? { __data["shows"] }

    /// Artist
    ///
    /// Parent Type: `Term`
    public struct Artist: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Interfaces.Term }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", HighForThisAPI.ObjID.self),
        .field("name", String.self),
        .field("slug", String.self),
        .inlineFragment(AsArtist.self),
      ] }

      public var id: HighForThisAPI.ObjID { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }

      public var asArtist: AsArtist? { _asInlineFragment() }

      /// Artist.AsArtist
      ///
      /// Parent Type: `Artist`
      public struct AsArtist: HighForThisAPI.InlineFragment {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public typealias RootEntityType = ArtistQuery.Data.Artist
        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("appleMusic", AppleMusic?.self),
        ] }

        public var appleMusic: AppleMusic? { __data["appleMusic"] }
        public var id: HighForThisAPI.ObjID { __data["id"] }
        public var name: String { __data["name"] }
        public var slug: String { __data["slug"] }

        /// Artist.AsArtist.AppleMusic
        ///
        /// Parent Type: `AppleMusicData`
        public struct AppleMusic: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicData }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("artwork", Artwork?.self),
            .field("id", String?.self),
            .field("url", String?.self),
          ] }

          public var artwork: Artwork? { __data["artwork"] }
          public var id: String? { __data["id"] }
          public var url: String? { __data["url"] }

          /// Artist.AsArtist.AppleMusic.Artwork
          ///
          /// Parent Type: `AppleMusicArtwork`
          public struct Artwork: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicArtwork }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("url", String?.self),
              .field("width", Int?.self),
              .field("height", Int?.self),
            ] }

            public var url: String? { __data["url"] }
            public var width: Int? { __data["width"] }
            public var height: Int? { __data["height"] }
          }
        }
      }
    }

    /// Shows
    ///
    /// Parent Type: `ShowConnection`
    public struct Shows: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
      ] }

      public var edges: [Edge] { __data["edges"] }

      /// Shows.Edge
      ///
      /// Parent Type: `ShowEdge`
      public struct Edge: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ShowEdge }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }

        public var node: Node { __data["node"] }

        /// Shows.Edge.Node
        ///
        /// Parent Type: `Show`
        public struct Node: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", HighForThisAPI.ObjID.self),
            .field("title", String?.self),
            .field("date", Double.self),
            .field("artist", Artist.self),
            .field("venue", Venue.self),
          ] }

          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var title: String? { __data["title"] }
          public var date: Double { __data["date"] }
          public var artist: Artist { __data["artist"] }
          public var venue: Venue { __data["venue"] }

          /// Shows.Edge.Node.Artist
          ///
          /// Parent Type: `Term`
          public struct Artist: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Interfaces.Term }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("id", HighForThisAPI.ObjID.self),
              .field("name", String.self),
            ] }

            public var id: HighForThisAPI.ObjID { __data["id"] }
            public var name: String { __data["name"] }
          }

          /// Shows.Edge.Node.Venue
          ///
          /// Parent Type: `Term`
          public struct Venue: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Interfaces.Term }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("id", HighForThisAPI.ObjID.self),
              .field("name", String.self),
            ] }

            public var id: HighForThisAPI.ObjID { __data["id"] }
            public var name: String { __data["name"] }
          }
        }
      }
    }
  }
}
