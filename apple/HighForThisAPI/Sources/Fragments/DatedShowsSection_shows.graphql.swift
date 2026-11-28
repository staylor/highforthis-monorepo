// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct DatedShowsSection_shows: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment DatedShowsSection_shows on ShowConnection { __typename edges { __typename node { __typename ...ShowList_show } } pageInfo { __typename hasNextPage } }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("edges", [Edge].self),
    .field("pageInfo", PageInfo.self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    DatedShowsSection_shows.self
  ] }

  public var edges: [Edge] { __data["edges"] }
  public var pageInfo: PageInfo { __data["pageInfo"] }

  /// Edge
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
      DatedShowsSection_shows.Edge.self
    ] }

    public var node: Node { __data["node"] }

    /// Edge.Node
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
        DatedShowsSection_shows.Edge.Node.self,
        ShowList_show.self
      ] }

      public var id: String { __data["id"] }
      /// Venue wall time encoded in New York for existing clients.
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

  /// PageInfo
  ///
  /// Parent Type: `PageInfo`
  nonisolated public struct PageInfo: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PageInfo }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("hasNextPage", Bool?.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      DatedShowsSection_shows.PageInfo.self
    ] }

    public var hasNextPage: Bool? { __data["hasNextPage"] }
  }
}
