// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct ShowsQuery: GraphQLQuery {
  public static let operationName: String = "Shows"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Shows($attended: Boolean, $first: Int!, $latest: Boolean, $year: Int) { shows(attended: $attended, first: $first, latest: $latest, year: $year) { __typename years edges { __typename node { __typename ...ShowList_show } } } }"#,
      fragments: [ShowList_show.self]
    ))

  public var attended: GraphQLNullable<Bool>
  public var first: Int32
  public var latest: GraphQLNullable<Bool>
  public var year: GraphQLNullable<Int32>

  public init(
    attended: GraphQLNullable<Bool>,
    first: Int32,
    latest: GraphQLNullable<Bool>,
    year: GraphQLNullable<Int32>
  ) {
    self.attended = attended
    self.first = first
    self.latest = latest
    self.year = year
  }

  @_spi(Unsafe) public var __variables: Variables? { [
    "attended": attended,
    "first": first,
    "latest": latest,
    "year": year
  ] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("shows", Shows?.self, arguments: [
        "attended": .variable("attended"),
        "first": .variable("first"),
        "latest": .variable("latest"),
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
        .field("years", [Int]?.self),
        .field("edges", [Edge].self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowsQuery.Data.Shows.self
      ] }

      public var years: [Int]? { __data["years"] }
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
    }
  }
}
