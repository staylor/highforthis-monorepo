// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct StatsLeader_stat: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment StatsLeader_stat on ShowStat { __typename count firstLocalDate lastLocalDate entity { __typename ... on Artist { id name slug appleMusic { __typename id artwork { __typename height url width } } } ... on Venue { id city name slug state } } }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowStat }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("count", Int.self),
    .field("firstLocalDate", String.self),
    .field("lastLocalDate", String.self),
    .field("entity", Entity.self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    StatsLeader_stat.self
  ] }

  public var count: Int { __data["count"] }
  public var firstLocalDate: String { __data["firstLocalDate"] }
  public var lastLocalDate: String { __data["lastLocalDate"] }
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
      StatsLeader_stat.Entity.self
    ] }

    public var asArtist: AsArtist? { _asInlineFragment() }
    public var asVenue: AsVenue? { _asInlineFragment() }

    /// Entity.AsArtist
    ///
    /// Parent Type: `Artist`
    nonisolated public struct AsArtist: HighForThisAPI.InlineFragment {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      public typealias RootEntityType = StatsLeader_stat.Entity
      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("id", String.self),
        .field("name", String.self),
        .field("slug", String.self),
        .field("appleMusic", AppleMusic?.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        StatsLeader_stat.Entity.self,
        StatsLeader_stat.Entity.AsArtist.self
      ] }

      public var id: String { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
      public var appleMusic: AppleMusic? { __data["appleMusic"] }

      /// Entity.AsArtist.AppleMusic
      ///
      /// Parent Type: `AppleMusicData`
      nonisolated public struct AppleMusic: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicData }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String?.self),
          .field("artwork", Artwork?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          StatsLeader_stat.Entity.AsArtist.AppleMusic.self
        ] }

        public var id: String? { __data["id"] }
        public var artwork: Artwork? { __data["artwork"] }

        /// Entity.AsArtist.AppleMusic.Artwork
        ///
        /// Parent Type: `AppleMusicArtwork`
        nonisolated public struct Artwork: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicArtwork }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("height", Int?.self),
            .field("url", String?.self),
            .field("width", Int?.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            StatsLeader_stat.Entity.AsArtist.AppleMusic.Artwork.self
          ] }

          public var height: Int? { __data["height"] }
          public var url: String? { __data["url"] }
          public var width: Int? { __data["width"] }
        }
      }
    }

    /// Entity.AsVenue
    ///
    /// Parent Type: `Venue`
    nonisolated public struct AsVenue: HighForThisAPI.InlineFragment {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      public typealias RootEntityType = StatsLeader_stat.Entity
      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("id", String.self),
        .field("city", String?.self),
        .field("name", String.self),
        .field("slug", String.self),
        .field("state", String?.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        StatsLeader_stat.Entity.self,
        StatsLeader_stat.Entity.AsVenue.self
      ] }

      public var id: String { __data["id"] }
      public var city: String? { __data["city"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
      public var state: String? { __data["state"] }
    }
  }
}
