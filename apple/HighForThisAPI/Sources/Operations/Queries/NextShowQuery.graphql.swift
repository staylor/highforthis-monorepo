// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct NextShowQuery: GraphQLQuery {
  public static let operationName: String = "NextShow"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query NextShow { shows(first: 1, latest: true) { __typename edges { __typename node { __typename id title artists { __typename id name } schedule { __typename localDate } venue { __typename id name } } } } }"#
    ))

  public init() {}

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("shows", Shows?.self, arguments: [
        "first": 1,
        "latest": true
      ]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      NextShowQuery.Data.self
    ] }

    public var shows: Shows? { __data["shows"] }

    /// Shows
    ///
    /// Parent Type: `ShowConnection`
    nonisolated public struct Shows: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        NextShowQuery.Data.Shows.self
      ] }

      public var edges: [Edge] { __data["edges"] }

      /// Shows.Edge
      ///
      /// Parent Type: `ShowEdge`
      nonisolated public struct Edge: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowEdge }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          NextShowQuery.Data.Shows.Edge.self
        ] }

        public var node: Node { __data["node"] }

        /// Shows.Edge.Node
        ///
        /// Parent Type: `Show`
        nonisolated public struct Node: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", String.self),
            .field("title", String?.self),
            .field("artists", [Artist].self),
            .field("schedule", Schedule.self),
            .field("venue", Venue.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            NextShowQuery.Data.Shows.Edge.Node.self
          ] }

          public var id: String { __data["id"] }
          public var title: String? { __data["title"] }
          public var artists: [Artist] { __data["artists"] }
          public var schedule: Schedule { __data["schedule"] }
          public var venue: Venue { __data["venue"] }

          /// Shows.Edge.Node.Artist
          ///
          /// Parent Type: `Artist`
          nonisolated public struct Artist: HighForThisAPI.SelectionSet {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
            @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("id", String.self),
              .field("name", String.self),
            ] }
            @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
              NextShowQuery.Data.Shows.Edge.Node.Artist.self
            ] }

            public var id: String { __data["id"] }
            public var name: String { __data["name"] }
          }

          /// Shows.Edge.Node.Schedule
          ///
          /// Parent Type: `ShowSchedule`
          nonisolated public struct Schedule: HighForThisAPI.SelectionSet {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowSchedule }
            @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("localDate", String.self),
            ] }
            @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
              NextShowQuery.Data.Shows.Edge.Node.Schedule.self
            ] }

            /// Advertised calendar day at the venue (YYYY-MM-DD).
            public var localDate: String { __data["localDate"] }
          }

          /// Shows.Edge.Node.Venue
          ///
          /// Parent Type: `Venue`
          nonisolated public struct Venue: HighForThisAPI.SelectionSet {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
            @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("id", String.self),
              .field("name", String.self),
            ] }
            @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
              NextShowQuery.Data.Shows.Edge.Node.Venue.self
            ] }

            public var id: String { __data["id"] }
            public var name: String { __data["name"] }
          }
        }
      }
    }
  }
}
