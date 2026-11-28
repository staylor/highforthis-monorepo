// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct ShowList_show: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment ShowList_show on Show { __typename id date title artists { __typename id name slug appleMusic { __typename id artwork { __typename height url width } } } venue { __typename id address city name slug state } }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", String.self),
    .field("date", Double.self),
    .field("title", String?.self),
    .field("artists", [Artist].self),
    .field("venue", Venue.self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    ShowList_show.self
  ] }

  public var id: String { __data["id"] }
  /// Venue wall time encoded in New York for existing clients.
  public var date: Double { __data["date"] }
  public var title: String? { __data["title"] }
  public var artists: [Artist] { __data["artists"] }
  public var venue: Venue { __data["venue"] }

  /// Artist
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
      .field("slug", String.self),
      .field("appleMusic", AppleMusic?.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ShowList_show.Artist.self
    ] }

    public var id: String { __data["id"] }
    public var name: String { __data["name"] }
    public var slug: String { __data["slug"] }
    public var appleMusic: AppleMusic? { __data["appleMusic"] }

    /// Artist.AppleMusic
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
        ShowList_show.Artist.AppleMusic.self
      ] }

      public var id: String? { __data["id"] }
      public var artwork: Artwork? { __data["artwork"] }

      /// Artist.AppleMusic.Artwork
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
          ShowList_show.Artist.AppleMusic.Artwork.self
        ] }

        public var height: Int? { __data["height"] }
        public var url: String? { __data["url"] }
        public var width: Int? { __data["width"] }
      }
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
      .field("city", String?.self),
      .field("name", String.self),
      .field("slug", String.self),
      .field("state", String?.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ShowList_show.Venue.self
    ] }

    public var id: String { __data["id"] }
    public var address: String? { __data["address"] }
    public var city: String? { __data["city"] }
    public var name: String { __data["name"] }
    public var slug: String { __data["slug"] }
    public var state: String? { __data["state"] }
  }
}
