// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ShowQuery: GraphQLQuery {
  public static let operationName: String = "Show"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Show($id: ObjID!) { show(id: $id) { __typename artists { __typename appleMusic { __typename artwork { __typename height url width } id url } id name slug } date id title venue { __typename id name slug } } }"#
    ))

  public var id: ObjID

  public init(id: ObjID) {
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
        .field("artists", [Artist].self),
        .field("date", Double.self),
        .field("id", HighForThisAPI.ObjID.self),
        .field("title", String?.self),
        .field("venue", Venue.self),
      ] }

      public var artists: [Artist] { __data["artists"] }
      public var date: Double { __data["date"] }
      public var id: HighForThisAPI.ObjID { __data["id"] }
      public var title: String? { __data["title"] }
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
          .field("appleMusic", AppleMusic?.self),
          .field("id", HighForThisAPI.ObjID.self),
          .field("name", String.self),
          .field("slug", String.self),
        ] }

        public var appleMusic: AppleMusic? { __data["appleMusic"] }
        public var id: HighForThisAPI.ObjID { __data["id"] }
        public var name: String { __data["name"] }
        public var slug: String { __data["slug"] }

        /// Show.Artist.AppleMusic
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
          .field("id", HighForThisAPI.ObjID.self),
          .field("name", String.self),
          .field("slug", String.self),
        ] }

        public var id: HighForThisAPI.ObjID { __data["id"] }
        public var name: String { __data["name"] }
        public var slug: String { __data["slug"] }
      }
    }
  }
}
