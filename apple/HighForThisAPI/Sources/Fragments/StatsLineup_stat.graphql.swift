// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct StatsLineup_stat: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment StatsLineup_stat on ShowStat { __typename count entity { __typename ... on Artist { id name slug } ... on Venue { id name slug } } }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowStat }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("count", Int.self),
    .field("entity", Entity.self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    StatsLineup_stat.self
  ] }

  public var count: Int { __data["count"] }
  public var entity: Entity { __data["entity"] }

  /// Entity
  ///
  /// Parent Type: `ShowEntity`
  nonisolated public struct Entity: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Unions.ShowEntity }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .inlineFragment(AsArtist.self),
      .inlineFragment(AsVenue.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      StatsLineup_stat.Entity.self
    ] }

    public var asArtist: AsArtist? { _asInlineFragment() }
    public var asVenue: AsVenue? { _asInlineFragment() }

    /// Entity.AsArtist
    ///
    /// Parent Type: `Artist`
    nonisolated public struct AsArtist: HighForThisAPI.InlineFragment {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      public typealias RootEntityType = StatsLineup_stat.Entity
      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("id", String.self),
        .field("name", String.self),
        .field("slug", String.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        StatsLineup_stat.Entity.self,
        StatsLineup_stat.Entity.AsArtist.self
      ] }

      public var id: String { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
    }

    /// Entity.AsVenue
    ///
    /// Parent Type: `Venue`
    nonisolated public struct AsVenue: HighForThisAPI.InlineFragment {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      public typealias RootEntityType = StatsLineup_stat.Entity
      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("id", String.self),
        .field("name", String.self),
        .field("slug", String.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        StatsLineup_stat.Entity.self,
        StatsLineup_stat.Entity.AsVenue.self
      ] }

      public var id: String { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
    }
  }
}
