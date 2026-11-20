// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct ShowsQuery: GraphQLQuery {
  public static let operationName: String = "Shows"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Shows($after: String, $artist: EntityArg, $attended: Boolean, $first: Int!, $includeYears: Boolean!, $latest: Boolean, $venue: EntityArg, $year: Int) { shows( after: $after artist: $artist attended: $attended first: $first latest: $latest venue: $venue year: $year ) { __typename years @include(if: $includeYears) edges { __typename node { __typename ...ShowList_show } } pageInfo { __typename endCursor hasNextPage } } }"#,
      fragments: [ShowList_show.self]
    ))

  public var after: GraphQLNullable<String>
  public var artist: GraphQLNullable<EntityArg>
  public var attended: GraphQLNullable<Bool>
  public var first: Int32
  public var includeYears: Bool
  public var latest: GraphQLNullable<Bool>
  public var venue: GraphQLNullable<EntityArg>
  public var year: GraphQLNullable<Int32>

  public init(
    after: GraphQLNullable<String>,
    artist: GraphQLNullable<EntityArg>,
    attended: GraphQLNullable<Bool>,
    first: Int32,
    includeYears: Bool,
    latest: GraphQLNullable<Bool>,
    venue: GraphQLNullable<EntityArg>,
    year: GraphQLNullable<Int32>
  ) {
    self.after = after
    self.artist = artist
    self.attended = attended
    self.first = first
    self.includeYears = includeYears
    self.latest = latest
    self.venue = venue
    self.year = year
  }

  @_spi(Unsafe) public var __variables: Variables? { [
    "after": after,
    "artist": artist,
    "attended": attended,
    "first": first,
    "includeYears": includeYears,
    "latest": latest,
    "venue": venue,
    "year": year
  ] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("shows", Shows?.self, arguments: [
        "after": .variable("after"),
        "artist": .variable("artist"),
        "attended": .variable("attended"),
        "first": .variable("first"),
        "latest": .variable("latest"),
        "venue": .variable("venue"),
        "year": .variable("year")
      ]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ShowsQuery.Data.self
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
        .field("pageInfo", PageInfo.self),
        .include(if: "includeYears", .field("years", [Int]?.self)),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowsQuery.Data.Shows.self
      ] }

      public var years: [Int]? { __data["years"] }
      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

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
          ShowsQuery.Data.Shows.Edge.self
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
            .fragment(ShowList_show.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            ShowsQuery.Data.Shows.Edge.Node.self,
            ShowList_show.self
          ] }

          public var id: String { __data["id"] }
          public var date: Double { __data["date"] }
          public var title: String? { __data["title"] }
          public var artists: [Artist] { __data["artists"] }
          public var venue: Venue { __data["venue"] }

          public struct Fragments: FragmentContainer {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            public var showList_show: ShowList_show { _toFragment() }
          }

          public typealias Artist = ShowList_show.Artist

          public typealias Venue = ShowList_show.Venue
        }
      }

      /// Shows.PageInfo
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
          ShowsQuery.Data.Shows.PageInfo.self
        ] }

        public var endCursor: String? { __data["endCursor"] }
        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }
  }
}
