// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class PostQuery: GraphQLQuery {
  public static let operationName: String = "Post"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Post($slug: String!) { post(slug: $slug) { __typename editorState { __typename root { __typename children { __typename ... on ElementNodeType { direction format indent type version } ... on HeadingNode { children { __typename ...TextNodes_linebreakNode ...TextNodes_textNode } tag } ... on ImageNode { image { __typename crops { __typename fileName width height } destination id } } ... on VideoNode { video { __typename ...Video_video } } ... on ElementNode { children { __typename ...TextNodes_linebreakNode ...TextNodes_textNode } } } direction format indent type version } } featuredMedia { __typename destination id ... on ImageUpload { crops { __typename fileName width } } } id slug summary title } }"#,
      fragments: [TextNodes_linebreakNode.self, TextNodes_textNode.self, Video_video.self]
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
      .field("post", Post?.self, arguments: ["slug": .variable("slug")]),
    ] }

    public var post: Post? { __data["post"] }

    /// Post
    ///
    /// Parent Type: `Post`
    public struct Post: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Post }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("editorState", EditorState?.self),
        .field("featuredMedia", [FeaturedMedium]?.self),
        .field("id", HighForThisAPI.ObjID.self),
        .field("slug", String.self),
        .field("summary", String?.self),
        .field("title", String.self),
      ] }

      public var editorState: EditorState? { __data["editorState"] }
      public var featuredMedia: [FeaturedMedium]? { __data["featuredMedia"] }
      public var id: HighForThisAPI.ObjID { __data["id"] }
      public var slug: String { __data["slug"] }
      public var summary: String? { __data["summary"] }
      public var title: String { __data["title"] }

      /// Post.EditorState
      ///
      /// Parent Type: `EditorState`
      public struct EditorState: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.EditorState }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("root", Root?.self),
        ] }

        public var root: Root? { __data["root"] }

        /// Post.EditorState.Root
        ///
        /// Parent Type: `ElementNode`
        public struct Root: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ElementNode }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("children", [Child?]?.self),
            .field("direction", GraphQLEnum<HighForThisAPI.ElementDirection>?.self),
            .field("format", Int?.self),
            .field("indent", Int?.self),
            .field("type", String?.self),
            .field("version", Int?.self),
          ] }

          public var children: [Child?]? { __data["children"] }
          public var direction: GraphQLEnum<HighForThisAPI.ElementDirection>? { __data["direction"] }
          public var format: Int? { __data["format"] }
          public var indent: Int? { __data["indent"] }
          public var type: String? { __data["type"] }
          public var version: Int? { __data["version"] }

          /// Post.EditorState.Root.Child
          ///
          /// Parent Type: `EditorNode`
          public struct Child: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .inlineFragment(AsElementNodeType.self),
              .inlineFragment(AsHeadingNode.self),
              .inlineFragment(AsImageNode.self),
              .inlineFragment(AsVideoNode.self),
              .inlineFragment(AsElementNode.self),
            ] }

            public var asElementNodeType: AsElementNodeType? { _asInlineFragment() }
            public var asHeadingNode: AsHeadingNode? { _asInlineFragment() }
            public var asImageNode: AsImageNode? { _asInlineFragment() }
            public var asVideoNode: AsVideoNode? { _asInlineFragment() }
            public var asElementNode: AsElementNode? { _asInlineFragment() }

            /// Post.EditorState.Root.Child.AsElementNodeType
            ///
            /// Parent Type: `ElementNodeType`
            public struct AsElementNodeType: HighForThisAPI.InlineFragment {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Interfaces.ElementNodeType }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("direction", GraphQLEnum<HighForThisAPI.ElementDirection>?.self),
                .field("format", Int?.self),
                .field("indent", Int?.self),
                .field("type", String?.self),
                .field("version", Int?.self),
              ] }

              public var direction: GraphQLEnum<HighForThisAPI.ElementDirection>? { __data["direction"] }
              public var format: Int? { __data["format"] }
              public var indent: Int? { __data["indent"] }
              public var type: String? { __data["type"] }
              public var version: Int? { __data["version"] }
            }

            /// Post.EditorState.Root.Child.AsHeadingNode
            ///
            /// Parent Type: `HeadingNode`
            public struct AsHeadingNode: HighForThisAPI.InlineFragment {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.HeadingNode }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("children", [Child?]?.self),
                .field("tag", GraphQLEnum<HighForThisAPI.HeadingTag>?.self),
              ] }

              public var children: [Child?]? { __data["children"] }
              public var tag: GraphQLEnum<HighForThisAPI.HeadingTag>? { __data["tag"] }
              public var direction: GraphQLEnum<HighForThisAPI.ElementDirection>? { __data["direction"] }
              public var format: Int? { __data["format"] }
              public var indent: Int? { __data["indent"] }
              public var type: String? { __data["type"] }
              public var version: Int? { __data["version"] }

              /// Post.EditorState.Root.Child.AsHeadingNode.Child
              ///
              /// Parent Type: `EditorNode`
              public struct Child: HighForThisAPI.SelectionSet {
                public let __data: DataDict
                public init(_dataDict: DataDict) { __data = _dataDict }

                public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
                public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .inlineFragment(AsLinebreakNode.self),
                  .inlineFragment(AsTextNode.self),
                ] }

                public var asLinebreakNode: AsLinebreakNode? { _asInlineFragment() }
                public var asTextNode: AsTextNode? { _asInlineFragment() }

                /// Post.EditorState.Root.Child.AsHeadingNode.Child.AsLinebreakNode
                ///
                /// Parent Type: `LinebreakNode`
                public struct AsLinebreakNode: HighForThisAPI.InlineFragment {
                  public let __data: DataDict
                  public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child
                  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
                  public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_linebreakNode.self),
                  ] }

                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    public let __data: DataDict
                    public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_linebreakNode: TextNodes_linebreakNode { _toFragment() }
                  }
                }

                /// Post.EditorState.Root.Child.AsHeadingNode.Child.AsTextNode
                ///
                /// Parent Type: `TextNode`
                public struct AsTextNode: HighForThisAPI.InlineFragment {
                  public let __data: DataDict
                  public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child
                  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
                  public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_textNode.self),
                  ] }

                  public var detail: Int? { __data["detail"] }
                  public var format: Int? { __data["format"] }
                  public var mode: GraphQLEnum<HighForThisAPI.TextModeType>? { __data["mode"] }
                  public var style: String? { __data["style"] }
                  public var text: String? { __data["text"] }
                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    public let __data: DataDict
                    public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_textNode: TextNodes_textNode { _toFragment() }
                  }
                }
              }
            }

            /// Post.EditorState.Root.Child.AsImageNode
            ///
            /// Parent Type: `ImageNode`
            public struct AsImageNode: HighForThisAPI.InlineFragment {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ImageNode }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("image", Image?.self),
              ] }

              public var image: Image? { __data["image"] }
              public var direction: GraphQLEnum<HighForThisAPI.ElementDirection>? { __data["direction"] }
              public var format: Int? { __data["format"] }
              public var indent: Int? { __data["indent"] }
              public var type: String? { __data["type"] }
              public var version: Int? { __data["version"] }

              /// Post.EditorState.Root.Child.AsImageNode.Image
              ///
              /// Parent Type: `ImageUpload`
              public struct Image: HighForThisAPI.SelectionSet {
                public let __data: DataDict
                public init(_dataDict: DataDict) { __data = _dataDict }

                public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUpload }
                public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .field("crops", [Crop].self),
                  .field("destination", String.self),
                  .field("id", HighForThisAPI.ObjID.self),
                ] }

                public var crops: [Crop] { __data["crops"] }
                public var destination: String { __data["destination"] }
                public var id: HighForThisAPI.ObjID { __data["id"] }

                /// Post.EditorState.Root.Child.AsImageNode.Image.Crop
                ///
                /// Parent Type: `ImageUploadCrop`
                public struct Crop: HighForThisAPI.SelectionSet {
                  public let __data: DataDict
                  public init(_dataDict: DataDict) { __data = _dataDict }

                  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUploadCrop }
                  public static var __selections: [ApolloAPI.Selection] { [
                    .field("__typename", String.self),
                    .field("fileName", String.self),
                    .field("width", Int.self),
                    .field("height", Int.self),
                  ] }

                  public var fileName: String { __data["fileName"] }
                  public var width: Int { __data["width"] }
                  public var height: Int { __data["height"] }
                }
              }
            }

            /// Post.EditorState.Root.Child.AsVideoNode
            ///
            /// Parent Type: `VideoNode`
            public struct AsVideoNode: HighForThisAPI.InlineFragment {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.VideoNode }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("video", Video?.self),
              ] }

              public var video: Video? { __data["video"] }
              public var direction: GraphQLEnum<HighForThisAPI.ElementDirection>? { __data["direction"] }
              public var format: Int? { __data["format"] }
              public var indent: Int? { __data["indent"] }
              public var type: String? { __data["type"] }
              public var version: Int? { __data["version"] }

              /// Post.EditorState.Root.Child.AsVideoNode.Video
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

            /// Post.EditorState.Root.Child.AsElementNode
            ///
            /// Parent Type: `ElementNode`
            public struct AsElementNode: HighForThisAPI.InlineFragment {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ElementNode }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("children", [Child?]?.self),
              ] }

              public var children: [Child?]? { __data["children"] }
              public var direction: GraphQLEnum<HighForThisAPI.ElementDirection>? { __data["direction"] }
              public var format: Int? { __data["format"] }
              public var indent: Int? { __data["indent"] }
              public var type: String? { __data["type"] }
              public var version: Int? { __data["version"] }

              /// Post.EditorState.Root.Child.AsElementNode.Child
              ///
              /// Parent Type: `EditorNode`
              public struct Child: HighForThisAPI.SelectionSet {
                public let __data: DataDict
                public init(_dataDict: DataDict) { __data = _dataDict }

                public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
                public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .inlineFragment(AsLinebreakNode.self),
                  .inlineFragment(AsTextNode.self),
                ] }

                public var asLinebreakNode: AsLinebreakNode? { _asInlineFragment() }
                public var asTextNode: AsTextNode? { _asInlineFragment() }

                /// Post.EditorState.Root.Child.AsElementNode.Child.AsLinebreakNode
                ///
                /// Parent Type: `LinebreakNode`
                public struct AsLinebreakNode: HighForThisAPI.InlineFragment {
                  public let __data: DataDict
                  public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child
                  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
                  public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_linebreakNode.self),
                  ] }

                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    public let __data: DataDict
                    public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_linebreakNode: TextNodes_linebreakNode { _toFragment() }
                  }
                }

                /// Post.EditorState.Root.Child.AsElementNode.Child.AsTextNode
                ///
                /// Parent Type: `TextNode`
                public struct AsTextNode: HighForThisAPI.InlineFragment {
                  public let __data: DataDict
                  public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child
                  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
                  public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_textNode.self),
                  ] }

                  public var detail: Int? { __data["detail"] }
                  public var format: Int? { __data["format"] }
                  public var mode: GraphQLEnum<HighForThisAPI.TextModeType>? { __data["mode"] }
                  public var style: String? { __data["style"] }
                  public var text: String? { __data["text"] }
                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    public let __data: DataDict
                    public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_textNode: TextNodes_textNode { _toFragment() }
                  }
                }
              }
            }
          }
        }
      }

      /// Post.FeaturedMedium
      ///
      /// Parent Type: `MediaUpload`
      public struct FeaturedMedium: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Interfaces.MediaUpload }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("destination", String.self),
          .field("id", HighForThisAPI.ObjID.self),
          .inlineFragment(AsImageUpload.self),
        ] }

        public var destination: String { __data["destination"] }
        public var id: HighForThisAPI.ObjID { __data["id"] }

        public var asImageUpload: AsImageUpload? { _asInlineFragment() }

        /// Post.FeaturedMedium.AsImageUpload
        ///
        /// Parent Type: `ImageUpload`
        public struct AsImageUpload: HighForThisAPI.InlineFragment {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public typealias RootEntityType = PostQuery.Data.Post.FeaturedMedium
          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUpload }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("crops", [Crop].self),
          ] }

          public var crops: [Crop] { __data["crops"] }
          public var destination: String { __data["destination"] }
          public var id: HighForThisAPI.ObjID { __data["id"] }

          /// Post.FeaturedMedium.AsImageUpload.Crop
          ///
          /// Parent Type: `ImageUploadCrop`
          public struct Crop: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUploadCrop }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("fileName", String.self),
              .field("width", Int.self),
            ] }

            public var fileName: String { __data["fileName"] }
            public var width: Int { __data["width"] }
          }
        }
      }
    }
  }
}
