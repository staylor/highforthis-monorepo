// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct VenueQuery: GraphQLQuery {
  public static let operationName: String = "Venue"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Venue($slug: String!) { attended: shows(attended: true, first: 5, venue: { slug: $slug }) { __typename ...DatedShowsSection_shows count } shows(first: 5, latest: true, venue: { slug: $slug }) { __typename ...DatedShowsSection_shows } venue(slug: $slug) { __typename id address capacity name slug website coordinates { __typename latitude longitude } } }"#,
      fragments: [DatedShowsSection_shows.self, ShowList_show.self]
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
        .fragment(DatedShowsSection_shows.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        VenueQuery.Data.Attended.self,
        DatedShowsSection_shows.self
      ] }

      public var count: Int? { __data["count"] }
      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var datedShowsSection_shows: DatedShowsSection_shows { _toFragment() }
      }

      public typealias Edge = DatedShowsSection_shows.Edge

      public typealias PageInfo = DatedShowsSection_shows.PageInfo
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
        .fragment(DatedShowsSection_shows.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        VenueQuery.Data.Shows.self,
        DatedShowsSection_shows.self
      ] }

      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var datedShowsSection_shows: DatedShowsSection_shows { _toFragment() }
      }

      public typealias Edge = DatedShowsSection_shows.Edge

      public typealias PageInfo = DatedShowsSection_shows.PageInfo
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
