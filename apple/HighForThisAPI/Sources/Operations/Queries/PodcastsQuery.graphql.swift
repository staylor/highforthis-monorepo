// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct PodcastsQuery: GraphQLQuery {
  public static let operationName: String = "Podcasts"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Podcasts($after: String, $first: Int!) { podcasts(after: $after, first: $first) { __typename edges { __typename node { __typename id date title } } pageInfo { __typename endCursor hasNextPage } } }"#
    ))

  public var after: GraphQLNullable<String>
  public var first: Int32

  public init(
    after: GraphQLNullable<String>,
    first: Int32
  ) {
    self.after = after
    self.first = first
  }

  @_spi(Unsafe) public var __variables: Variables? { [
    "after": after,
    "first": first
  ] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("podcasts", Podcasts?.self, arguments: [
        "after": .variable("after"),
        "first": .variable("first")
      ]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      PodcastsQuery.Data.self
    ] }

    public var podcasts: Podcasts? { __data["podcasts"] }

    /// Podcasts
    ///
    /// Parent Type: `PodcastConnection`
    nonisolated public struct Podcasts: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PodcastConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
        .field("pageInfo", PageInfo.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        PodcastsQuery.Data.Podcasts.self
      ] }

      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      /// Podcasts.Edge
      ///
      /// Parent Type: `PodcastEdge`
      nonisolated public struct Edge: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PodcastEdge }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          PodcastsQuery.Data.Podcasts.Edge.self
        ] }

        public var node: Node { __data["node"] }

        /// Podcasts.Edge.Node
        ///
        /// Parent Type: `Podcast`
        nonisolated public struct Node: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Podcast }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", String.self),
            .field("date", Double?.self),
            .field("title", String.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            PodcastsQuery.Data.Podcasts.Edge.Node.self
          ] }

          public var id: String { __data["id"] }
          public var date: Double? { __data["date"] }
          public var title: String { __data["title"] }
        }
      }

      /// Podcasts.PageInfo
      ///
      /// Parent Type: `PageInfo`
      nonisolated public struct PageInfo: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PageInfo }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("endCursor", String?.self),
          .field("hasNextPage", Bool?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          PodcastsQuery.Data.Podcasts.PageInfo.self
        ] }

        public var endCursor: String? { __data["endCursor"] }
        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }
  }
}
