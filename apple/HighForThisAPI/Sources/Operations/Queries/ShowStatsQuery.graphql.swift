// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct ShowStatsQuery: GraphQLQuery {
  public static let operationName: String = "ShowStats"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query ShowStats($leaders: Int!) { artistLeaders: showStats(entity: ARTIST, first: $leaders) { __typename ...StatsLeader_stat } artists: showStats(entity: ARTIST) { __typename ...StatsLineup_stat } showTotals { __typename artists firstDate shows venues } venueLeaders: showStats(entity: VENUE, first: $leaders) { __typename ...StatsLeader_stat } venues: showStats(entity: VENUE) { __typename ...StatsLineup_stat } }"#,
      fragments: [StatsLeader_stat.self, StatsLineup_stat.self]
    ))

  public var leaders: Int32

  public init(leaders: Int32) {
    self.leaders = leaders
  }

  @_spi(Unsafe) public var __variables: Variables? { ["leaders": leaders] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("showStats", alias: "artistLeaders", [ArtistLeader].self, arguments: [
        "entity": "ARTIST",
        "first": .variable("leaders")
      ]),
      .field("showStats", alias: "artists", [Artist].self, arguments: ["entity": "ARTIST"]),
      .field("showTotals", ShowTotals.self),
      .field("showStats", alias: "venueLeaders", [VenueLeader].self, arguments: [
        "entity": "VENUE",
        "first": .variable("leaders")
      ]),
      .field("showStats", alias: "venues", [Venue].self, arguments: ["entity": "VENUE"]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ShowStatsQuery.Data.self
    ] }

    public var artistLeaders: [ArtistLeader] { __data["artistLeaders"] }
    public var artists: [Artist] { __data["artists"] }
    public var showTotals: ShowTotals { __data["showTotals"] }
    public var venueLeaders: [VenueLeader] { __data["venueLeaders"] }
    public var venues: [Venue] { __data["venues"] }

    /// ArtistLeader
    ///
    /// Parent Type: `ShowStat`
    nonisolated public struct ArtistLeader: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowStat }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(StatsLeader_stat.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowStatsQuery.Data.ArtistLeader.self,
        StatsLeader_stat.self
      ] }

      public var count: Int { __data["count"] }
      public var firstDate: Double { __data["firstDate"] }
      public var lastDate: Double { __data["lastDate"] }
      public var entity: Entity { __data["entity"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var statsLeader_stat: StatsLeader_stat { _toFragment() }
      }

      public typealias Entity = StatsLeader_stat.Entity
    }

    /// Artist
    ///
    /// Parent Type: `ShowStat`
    nonisolated public struct Artist: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowStat }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(StatsLineup_stat.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowStatsQuery.Data.Artist.self,
        StatsLineup_stat.self
      ] }

      public var count: Int { __data["count"] }
      public var entity: Entity { __data["entity"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var statsLineup_stat: StatsLineup_stat { _toFragment() }
      }

      public typealias Entity = StatsLineup_stat.Entity
    }

    /// ShowTotals
    ///
    /// Parent Type: `ShowTotals`
    nonisolated public struct ShowTotals: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowTotals }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("artists", Int.self),
        .field("firstDate", Double?.self),
        .field("shows", Int.self),
        .field("venues", Int.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowStatsQuery.Data.ShowTotals.self
      ] }

      public var artists: Int { __data["artists"] }
      public var firstDate: Double? { __data["firstDate"] }
      public var shows: Int { __data["shows"] }
      public var venues: Int { __data["venues"] }
    }

    /// VenueLeader
    ///
    /// Parent Type: `ShowStat`
    nonisolated public struct VenueLeader: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowStat }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(StatsLeader_stat.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowStatsQuery.Data.VenueLeader.self,
        StatsLeader_stat.self
      ] }

      public var count: Int { __data["count"] }
      public var firstDate: Double { __data["firstDate"] }
      public var lastDate: Double { __data["lastDate"] }
      public var entity: Entity { __data["entity"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var statsLeader_stat: StatsLeader_stat { _toFragment() }
      }

      public typealias Entity = StatsLeader_stat.Entity
    }

    /// Venue
    ///
    /// Parent Type: `ShowStat`
    nonisolated public struct Venue: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowStat }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(StatsLineup_stat.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ShowStatsQuery.Data.Venue.self,
        StatsLineup_stat.self
      ] }

      public var count: Int { __data["count"] }
      public var entity: Entity { __data["entity"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var statsLineup_stat: StatsLineup_stat { _toFragment() }
      }

      public typealias Entity = StatsLineup_stat.Entity
    }
  }
}
