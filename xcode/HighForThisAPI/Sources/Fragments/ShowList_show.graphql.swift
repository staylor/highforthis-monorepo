// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct ShowList_show: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment ShowList_show on Show { __typename id date title artists { __typename id name slug } venue { __typename id name slug } }"#
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
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ShowList_show.Artist.self
    ] }

    public var id: String { __data["id"] }
    public var name: String { __data["name"] }
    public var slug: String { __data["slug"] }
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
      .field("name", String.self),
      .field("slug", String.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ShowList_show.Venue.self
    ] }

    public var id: String { __data["id"] }
    public var name: String { __data["name"] }
    public var slug: String { __data["slug"] }
  }
}
