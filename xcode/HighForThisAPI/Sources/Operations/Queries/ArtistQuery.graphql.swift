// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ArtistQuery: GraphQLQuery {
  public static let operationName: String = "Artist"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Artist($slug: String!) { artist(slug: $slug) { __typename appleMusic { __typename artwork { __typename height url width } id url } id name slug website } attended: shows(artist: { slug: $slug }, attended: true, first: 200) { __typename edges { __typename node { __typename ...ShowList_show } } } shows(artist: { slug: $slug }, first: 200, latest: true) { __typename edges { __typename node { __typename ...ShowList_show } } } }"#,
      fragments: [ShowList_show.self]
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
      .field("artist", Artist?.self, arguments: ["slug": .variable("slug")]),
      .field("shows", alias: "attended", Attended?.self, arguments: [
        "artist": ["slug": .variable("slug")],
        "attended": true,
        "first": 200
      ]),
      .field("shows", Shows?.self, arguments: [
        "artist": ["slug": .variable("slug")],
        "first": 200,
        "latest": true
      ]),
    ] }

    public var artist: Artist? { __data["artist"] }
    public var attended: Attended? { __data["attended"] }
    public var shows: Shows? { __data["shows"] }

    /// Artist
    ///
    /// Parent Type: `Artist`
    public struct Artist: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("appleMusic", AppleMusic?.self),
        .field("id", HighForThisAPI.ObjID.self),
        .field("name", String.self),
        .field("slug", String.self),
        .field("website", String?.self),
      ] }

      public var appleMusic: AppleMusic? { __data["appleMusic"] }
      public var id: HighForThisAPI.ObjID { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
      public var website: String? { __data["website"] }

      /// Artist.AppleMusic
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

        /// Artist.AppleMusic.Artwork
        ///
        /// Parent Type: `AppleMusicArtwork`
        public struct Artwork: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicArtwork }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("height", Int?.self),
            .field("url", String?.self),
            .field("width", Int?.self),
          ] }

          public var height: Int? { __data["height"] }
          public var url: String? { __data["url"] }
          public var width: Int? { __data["width"] }
        }
      }
    }

    /// Attended
    ///
    /// Parent Type: `ShowConnection`
    public struct Attended: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
      ] }

      public var edges: [Edge] { __data["edges"] }

      /// Attended.Edge
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

        /// Attended.Edge.Node
        ///
        /// Parent Type: `Show`
        public struct Node: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .fragment(ShowList_show.self),
          ] }

          public var artists: [Artist] { __data["artists"] }
          public var date: Double { __data["date"] }
          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var title: String? { __data["title"] }
          public var venue: Venue { __data["venue"] }

          public struct Fragments: FragmentContainer {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public var showList_show: ShowList_show { _toFragment() }
          }

          public typealias Artist = ShowList_show.Artist

          public typealias Venue = ShowList_show.Venue
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
            .fragment(ShowList_show.self),
          ] }

          public var artists: [Artist] { __data["artists"] }
          public var date: Double { __data["date"] }
          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var title: String? { __data["title"] }
          public var venue: Venue { __data["venue"] }

          public struct Fragments: FragmentContainer {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public var showList_show: ShowList_show { _toFragment() }
          }

          public typealias Artist = ShowList_show.Artist

          public typealias Venue = ShowList_show.Venue
        }
      }
    }
  }
}
