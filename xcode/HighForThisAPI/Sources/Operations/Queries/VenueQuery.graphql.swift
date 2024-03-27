// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class VenueQuery: GraphQLQuery {
  public static let operationName: String = "Venue"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Venue($slug: String!) { venue: term(slug: $slug, taxonomy: "venue") { __typename id name slug ... on Venue { address capacity coordinates { __typename latitude longitude } } } shows(latest: true, first: 200, term: $slug, taxonomy: "venue") { __typename edges { __typename node { __typename id title date artist { __typename id name } venue { __typename id name } } } } }"#
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
      .field("term", alias: "venue", Venue?.self, arguments: [
        "slug": .variable("slug"),
        "taxonomy": "venue"
      ]),
      .field("shows", Shows?.self, arguments: [
        "latest": true,
        "first": 200,
        "term": .variable("slug"),
        "taxonomy": "venue"
      ]),
    ] }

    public var venue: Venue? { __data["venue"] }
    public var shows: Shows? { __data["shows"] }

    /// Venue
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

      /// Venue.AsVenue
      ///
      /// Parent Type: `Venue`
      public struct AsVenue: HighForThisAPI.InlineFragment {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public typealias RootEntityType = VenueQuery.Data.Venue
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

        /// Venue.AsVenue.Coordinates
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
