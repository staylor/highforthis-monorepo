// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct Video_video: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment Video_video on Video { __typename id dataId slug title thumbnails { __typename height url width } }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Video }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", String.self),
    .field("dataId", String.self),
    .field("slug", String.self),
    .field("title", String.self),
    .field("thumbnails", [Thumbnail].self),
  ] }

  public var id: String { __data["id"] }
  public var dataId: String { __data["dataId"] }
  public var slug: String { __data["slug"] }
  public var title: String { __data["title"] }
  public var thumbnails: [Thumbnail] { __data["thumbnails"] }

  /// Thumbnail
  ///
  /// Parent Type: `VideoThumbnail`
  public struct Thumbnail: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.VideoThumbnail }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("height", Int.self),
      .field("url", String.self),
      .field("width", Int.self),
    ] }

    public var height: Int { __data["height"] }
    public var url: String { __data["url"] }
    public var width: Int { __data["width"] }
  }
}
