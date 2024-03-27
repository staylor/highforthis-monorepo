// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class VideoQuery: GraphQLQuery {
  public static let operationName: String = "Video"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Video($slug: String!) { video(slug: $slug) { __typename ...Video_video } }"#,
      fragments: [Video_video.self]
    ))

  public var slug: String

  public init(slug: String) {
    self.slug = slug
  }

  public var __variables: Variables? { ["slug": slug] }

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("video", Video?.self, arguments: ["slug": .variable("slug")]),
    ] }

    public var video: Video? { __data["video"] }

    /// Video
    ///
    /// Parent Type: `Video`
    public struct Video: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Video }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(Video_video.self),
      ] }

      public var dataId: String { __data["dataId"] }
      public var id: HighForThisAPI.ObjID { __data["id"] }
      public var slug: String { __data["slug"] }
      public var thumbnails: [Thumbnail] { __data["thumbnails"] }
      public var title: String { __data["title"] }

      public struct Fragments: FragmentContainer {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public var video_video: Video_video { _toFragment() }
      }

      public typealias Thumbnail = Video_video.Thumbnail
    }
  }
}
