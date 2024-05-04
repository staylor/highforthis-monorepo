// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct ShowList_show: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment ShowList_show on Show { __typename artist { __typename id name slug } date id title venue { __typename id name slug } }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("artist", Artist.self),
    .field("date", Double.self),
    .field("id", HighForThisAPI.ObjID.self),
    .field("title", String?.self),
    .field("venue", Venue.self),
  ] }

  public var artist: Artist { __data["artist"] }
  public var date: Double { __data["date"] }
  public var id: HighForThisAPI.ObjID { __data["id"] }
  public var title: String? { __data["title"] }
  public var venue: Venue { __data["venue"] }

  /// Artist
  ///
  /// Parent Type: `Artist`
  public struct Artist: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Artist }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("id", HighForThisAPI.ObjID.self),
      .field("name", String.self),
      .field("slug", String.self),
    ] }

    public var id: HighForThisAPI.ObjID { __data["id"] }
    public var name: String { __data["name"] }
    public var slug: String { __data["slug"] }
  }

  /// Venue
  ///
  /// Parent Type: `Venue`
  public struct Venue: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Venue }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("id", HighForThisAPI.ObjID.self),
      .field("name", String.self),
      .field("slug", String.self),
    ] }

    public var id: HighForThisAPI.ObjID { __data["id"] }
    public var name: String { __data["name"] }
    public var slug: String { __data["slug"] }
  }
}
