// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ShowQuery: GraphQLQuery {
  public static let operationName: String = "Show"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Show($id: ObjID!) { show(id: $id) { __typename id title date artist { __typename id name slug ... on Artist { appleMusic { __typename id url artwork { __typename url height width } } } } venue { __typename id name slug ... on Venue { address capacity coordinates { __typename latitude longitude } } } } }"#
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

      /// Show.Artist
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

        /// Show.Artist.AsArtist
        ///
        /// Parent Type: `Artist`
        public struct AsArtist: HighForThisAPI.InlineFragment {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public typealias RootEntityType = ShowQuery.Data.Show.Artist
          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("appleMusic", AppleMusic?.self),
          ] }

          public var appleMusic: AppleMusic? { __data["appleMusic"] }
          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var name: String { __data["name"] }
          public var slug: String { __data["slug"] }

          /// Show.Artist.AsArtist.AppleMusic
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

            /// Show.Artist.AsArtist.AppleMusic.Artwork
            ///
            /// Parent Type: `AppleMusicArtwork`
            public struct Artwork: HighForThisAPI.SelectionSet {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicArtwork }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("__typename", String.self),
                .field("url", String?.self),
                .field("height", Int?.self),
                .field("width", Int?.self),
              ] }

              public var url: String? { __data["url"] }
              public var height: Int? { __data["height"] }
              public var width: Int? { __data["width"] }
            }
          }
        }
      }

      /// Show.Venue
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
          .field("slug", String.self),
          .inlineFragment(AsVenue.self),
        ] }

        public var id: HighForThisAPI.ObjID { __data["id"] }
        public var name: String { __data["name"] }
        public var slug: String { __data["slug"] }

        public var asVenue: AsVenue? { _asInlineFragment() }

        /// Show.Venue.AsVenue
        ///
        /// Parent Type: `Venue`
        public struct AsVenue: HighForThisAPI.InlineFragment {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public typealias RootEntityType = ShowQuery.Data.Show.Venue
          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("address", String?.self),
            .field("capacity", String?.self),
            .field("coordinates", Coordinates?.self),
          ] }

          public var address: String? { __data["address"] }
          public var capacity: String? { __data["capacity"] }
          public var coordinates: Coordinates? { __data["coordinates"] }
          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var name: String { __data["name"] }
          public var slug: String { __data["slug"] }

          /// Show.Venue.AsVenue.Coordinates
          ///
          /// Parent Type: `VenueCoordinates`
          public struct Coordinates: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.VenueCoordinates }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("latitude", Double?.self),
              .field("longitude", Double?.self),
            ] }

            public var latitude: Double? { __data["latitude"] }
            public var longitude: Double? { __data["longitude"] }
          }
        }
      }
    }
  }
}
