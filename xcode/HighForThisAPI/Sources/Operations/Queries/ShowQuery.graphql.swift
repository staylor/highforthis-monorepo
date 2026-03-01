// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ShowQuery: GraphQLQuery {
  public static let operationName: String = "Show"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Show($id: String!) { show(id: $id) { __typename id date title artists { __typename id name slug appleMusic { __typename id url artwork { __typename height url width } } } venue { __typename id name slug } } }"#
    ))

  public var id: String

  public init(id: String) {
    self.id = id
  }

  public var __variables: Variables? { ["id": id] }

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("show", Show?.self, arguments: ["id": .variable("id")]),
    ] }

    public var show: Show? { __data["show"] }

    /// Show
    ///
    /// Parent Type: `Show`
    public struct Show: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", String.self),
        .field("date", Double.self),
        .field("title", String?.self),
        .field("artists", [Artist].self),
        .field("venue", Venue.self),
      ] }

      public var id: String { __data["id"] }
      public var date: Double { __data["date"] }
      public var title: String? { __data["title"] }
      public var artists: [Artist] { __data["artists"] }
      public var venue: Venue { __data["venue"] }

      /// Show.Artist
      ///
      /// Parent Type: `Artist`
      public struct Artist: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String.self),
          .field("name", String.self),
          .field("slug", String.self),
          .field("appleMusic", AppleMusic?.self),
        ] }

        public var id: String { __data["id"] }
        public var name: String { __data["name"] }
        public var slug: String { __data["slug"] }
        public var appleMusic: AppleMusic? { __data["appleMusic"] }

        /// Show.Artist.AppleMusic
        ///
        /// Parent Type: `AppleMusicData`
        public struct AppleMusic: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicData }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", String?.self),
            .field("url", String?.self),
            .field("artwork", Artwork?.self),
          ] }

          public var id: String? { __data["id"] }
          public var url: String? { __data["url"] }
          public var artwork: Artwork? { __data["artwork"] }

          /// Show.Artist.AppleMusic.Artwork
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

      /// Show.Venue
      ///
      /// Parent Type: `Venue`
      public struct Venue: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String.self),
          .field("name", String.self),
          .field("slug", String.self),
        ] }

        public var id: String { __data["id"] }
        public var name: String { __data["name"] }
        public var slug: String { __data["slug"] }
      }
    }
  }
}
