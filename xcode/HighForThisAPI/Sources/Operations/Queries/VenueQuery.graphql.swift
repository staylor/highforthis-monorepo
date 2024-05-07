// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class VenueQuery: GraphQLQuery {
  public static let operationName: String = "Venue"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Venue($slug: String!) { attended: shows(attended: true, first: 200, venueSlug: $slug) { __typename edges { __typename node { __typename ...ShowList_show } } } shows(first: 200, latest: true, venueSlug: $slug) { __typename edges { __typename node { __typename ...ShowList_show } } } venue(slug: $slug) { __typename address capacity coordinates { __typename latitude longitude } id name slug website } }"#,
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
      .field("shows", alias: "attended", Attended?.self, arguments: [
        "attended": true,
        "first": 200,
        "venueSlug": .variable("slug")
      ]),
      .field("shows", Shows?.self, arguments: [
        "first": 200,
        "latest": true,
        "venueSlug": .variable("slug")
      ]),
      .field("venue", Venue?.self, arguments: ["slug": .variable("slug")]),
    ] }

    public var attended: Attended? { __data["attended"] }
    public var shows: Shows? { __data["shows"] }
    public var venue: Venue? { __data["venue"] }

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

    /// Venue
    ///
    /// Parent Type: `Venue`
    public struct Venue: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("address", String?.self),
        .field("capacity", String?.self),
        .field("coordinates", Coordinates?.self),
        .field("id", HighForThisAPI.ObjID.self),
        .field("name", String.self),
        .field("slug", String.self),
        .field("website", String?.self),
      ] }

      public var address: String? { __data["address"] }
      public var capacity: String? { __data["capacity"] }
      public var coordinates: Coordinates? { __data["coordinates"] }
      public var id: HighForThisAPI.ObjID { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
      public var website: String? { __data["website"] }

      /// Venue.Coordinates
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
