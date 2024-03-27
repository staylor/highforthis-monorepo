// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ShowsQuery: GraphQLQuery {
  public static let operationName: String = "Shows"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Shows { shows(latest: true, first: 200) { __typename edges { __typename node { __typename id title date artist { __typename id name } venue { __typename id name } } } } }"#
    ))

  public init() {}

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("shows", Shows?.self, arguments: [
        "latest": true,
        "first": 200
      ]),
    ] }

    public var shows: Shows? { __data["shows"] }

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
