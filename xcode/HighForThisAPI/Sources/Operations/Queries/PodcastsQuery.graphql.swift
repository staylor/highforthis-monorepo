// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class PodcastsQuery: GraphQLQuery {
  public static let operationName: String = "Podcasts"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Podcasts { podcasts(first: 200) { __typename edges { __typename node { __typename id title } } } }"#
    ))

  public init() {}

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("podcasts", Podcasts?.self, arguments: ["first": 200]),
    ] }

    public var podcasts: Podcasts? { __data["podcasts"] }

    /// Podcasts
    ///
    /// Parent Type: `PodcastConnection`
    public struct Podcasts: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.PodcastConnection }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
      ] }

      public var edges: [Edge] { __data["edges"] }

      /// Podcasts.Edge
      ///
      /// Parent Type: `PodcastEdge`
      public struct Edge: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.PodcastEdge }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }

        public var node: Node { __data["node"] }

        /// Podcasts.Edge.Node
        ///
        /// Parent Type: `Podcast`
        public struct Node: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Podcast }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", HighForThisAPI.ObjID.self),
            .field("title", String.self),
          ] }

          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var title: String { __data["title"] }
        }
      }
    }
  }
}
