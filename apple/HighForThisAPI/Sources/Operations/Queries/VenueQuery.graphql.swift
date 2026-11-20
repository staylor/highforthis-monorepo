// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct VenueQuery: GraphQLQuery {
  public static let operationName: String = "Venue"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Venue($slug: String!) { attended: shows(attended: true, first: 5, venue: { slug: $slug }) { __typename count edges { __typename node { __typename ...ShowList_show } } pageInfo { __typename hasNextPage } } shows(first: 5, latest: true, venue: { slug: $slug }) { __typename edges { __typename node { __typename ...ShowList_show } } pageInfo { __typename hasNextPage } } venue(slug: $slug) { __typename id address capacity name slug website coordinates { __typename latitude longitude } } }"#,
      fragments: [ShowList_show.self]
    ))

  public var slug: String

  public init(slug: String) {
    self.slug = slug
  }

  @_spi(Unsafe) public var __variables: Variables? { ["slug": slug] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("shows", alias: "attended", Attended?.self, arguments: [
        "attended": true,
        "first": 5,
        "venue": ["slug": .variable("slug")]
      ]),
      .field("shows", Shows?.self, arguments: [
        "first": 5,
        "latest": true,
        "venue": ["slug": .variable("slug")]
      ]),
      .field("venue", Venue?.self, arguments: ["slug": .variable("slug")]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      VenueQuery.Data.self
    ] }

    public var attended: Attended? { __data["attended"] }
    public var shows: Shows? { __data["shows"] }
    public var venue: Venue? { __data["venue"] }

    /// Attended
    ///
    /// Parent Type: `ShowConnection`
    nonisolated public struct Attended: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("count", Int?.self),
        .field("edges", [Edge].self),
        .field("pageInfo", PageInfo.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        VenueQuery.Data.Attended.self
      ] }

      public var count: Int? { __data["count"] }
      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      /// Attended.Edge
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
          VenueQuery.Data.Attended.Edge.self
        ] }

        public var node: Node { __data["node"] }

        /// Attended.Edge.Node
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
            VenueQuery.Data.Attended.Edge.Node.self,
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

      /// Attended.PageInfo
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
          VenueQuery.Data.Attended.PageInfo.self
        ] }

        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }

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
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        VenueQuery.Data.Shows.self
      ] }

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
          VenueQuery.Data.Shows.Edge.self
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
            VenueQuery.Data.Shows.Edge.Node.self,
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
          .field("hasNextPage", Bool?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          VenueQuery.Data.Shows.PageInfo.self
        ] }

        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }

    /// Venue
    ///
    /// Parent Type: `Venue`
    nonisolated public struct Venue: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", String.self),
        .field("address", String?.self),
        .field("capacity", String?.self),
        .field("name", String.self),
        .field("slug", String.self),
        .field("website", String?.self),
        .field("coordinates", Coordinates?.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        VenueQuery.Data.Venue.self
      ] }

      public var id: String { __data["id"] }
      public var address: String? { __data["address"] }
      public var capacity: String? { __data["capacity"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
      public var website: String? { __data["website"] }
      public var coordinates: Coordinates? { __data["coordinates"] }

      /// Venue.Coordinates
      ///
      /// Parent Type: `VenueCoordinates`
      nonisolated public struct Coordinates: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.VenueCoordinates }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("latitude", Double?.self),
          .field("longitude", Double?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          VenueQuery.Data.Venue.Coordinates.self
        ] }

        public var latitude: Double? { __data["latitude"] }
        public var longitude: Double? { __data["longitude"] }
      }
    }
  }
}
