// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct Video_video: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment Video_video on Video { __typename id dataId slug title thumbnails { __typename height url width } }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Video }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", String.self),
    .field("dataId", String.self),
    .field("slug", String.self),
    .field("title", String.self),
    .field("thumbnails", [Thumbnail].self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    Video_video.self
  ] }

  public var id: String { __data["id"] }
  public var dataId: String { __data["dataId"] }
  public var slug: String { __data["slug"] }
  public var title: String { __data["title"] }
  public var thumbnails: [Thumbnail] { __data["thumbnails"] }

  /// Thumbnail
  ///
  /// Parent Type: `VideoThumbnail`
  nonisolated public struct Thumbnail: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.VideoThumbnail }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("height", Int.self),
      .field("url", String.self),
      .field("width", Int.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      Video_video.Thumbnail.self
    ] }

    public var height: Int { __data["height"] }
    public var url: String { __data["url"] }
    public var width: Int { __data["width"] }
  }
}
