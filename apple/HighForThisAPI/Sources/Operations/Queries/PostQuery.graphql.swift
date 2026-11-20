// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct PostQuery: GraphQLQuery {
  public static let operationName: String = "Post"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Post($slug: String!) { post(slug: $slug) { __typename id title editorState { __typename root { __typename children { __typename ... on HeadingNode { tag children { __typename ...TextNodes_linebreakNode ...TextNodes_textNode } } ... on ImageNode { image { __typename id altText destination crops { __typename fileName height width } } } ... on VideoNode { video { __typename ...Video_video } } ... on ElementNode { type children { __typename ...TextNodes_linebreakNode ...TextNodes_textNode } } ... on QuoteNode { children { __typename ...TextNodes_linebreakNode ...TextNodes_textNode } } ... on CodeNode { children { __typename ...TextNodes_linebreakNode ...TextNodes_textNode } } } } } } }"#,
      fragments: [TextNodes_linebreakNode.self, TextNodes_textNode.self, Video_video.self]
    ))

  public var slug: String

  public init(slug: String) {
    self.slug = slug
  }

  @_spi(Unsafe) public var __variables: Variables? { ["slug": slug] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("post", Post?.self, arguments: ["slug": .variable("slug")]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      PostQuery.Data.self
    ] }

    public var post: Post? { __data["post"] }

    /// Post
    ///
    /// Parent Type: `Post`
    nonisolated public struct Post: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Post }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", String.self),
        .field("title", String.self),
        .field("editorState", EditorState?.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        PostQuery.Data.Post.self
      ] }

      public var id: String { __data["id"] }
      public var title: String { __data["title"] }
      public var editorState: EditorState? { __data["editorState"] }

      /// Post.EditorState
      ///
      /// Parent Type: `EditorState`
      nonisolated public struct EditorState: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.EditorState }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("root", Root?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          PostQuery.Data.Post.EditorState.self
        ] }

        public var root: Root? { __data["root"] }

        /// Post.EditorState.Root
        ///
        /// Parent Type: `ElementNode`
        nonisolated public struct Root: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ElementNode }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("children", [Child?]?.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            PostQuery.Data.Post.EditorState.Root.self
          ] }

          public var children: [Child?]? { __data["children"] }

          /// Post.EditorState.Root.Child
          ///
          /// Parent Type: `EditorNode`
          nonisolated public struct Child: HighForThisAPI.SelectionSet {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
            @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .inlineFragment(AsHeadingNode.self),
              .inlineFragment(AsImageNode.self),
              .inlineFragment(AsVideoNode.self),
              .inlineFragment(AsElementNode.self),
              .inlineFragment(AsQuoteNode.self),
              .inlineFragment(AsCodeNode.self),
            ] }
            @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
              PostQuery.Data.Post.EditorState.Root.Child.self
            ] }

            public var asHeadingNode: AsHeadingNode? { _asInlineFragment() }
            public var asImageNode: AsImageNode? { _asInlineFragment() }
            public var asVideoNode: AsVideoNode? { _asInlineFragment() }
            public var asElementNode: AsElementNode? { _asInlineFragment() }
            public var asQuoteNode: AsQuoteNode? { _asInlineFragment() }
            public var asCodeNode: AsCodeNode? { _asInlineFragment() }

            /// Post.EditorState.Root.Child.AsHeadingNode
            ///
            /// Parent Type: `HeadingNode`
            nonisolated public struct AsHeadingNode: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.HeadingNode }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("tag", GraphQLEnum<HighForThisAPI.HeadingTag>?.self),
                .field("children", [Child?]?.self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostQuery.Data.Post.EditorState.Root.Child.self,
                PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.self
              ] }

              public var tag: GraphQLEnum<HighForThisAPI.HeadingTag>? { __data["tag"] }
              public var children: [Child?]? { __data["children"] }

              /// Post.EditorState.Root.Child.AsHeadingNode.Child
              ///
              /// Parent Type: `EditorNode`
              nonisolated public struct Child: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .inlineFragment(AsLinebreakNode.self),
                  .inlineFragment(AsTextNode.self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child.self
                ] }

                public var asLinebreakNode: AsLinebreakNode? { _asInlineFragment() }
                public var asTextNode: AsTextNode? { _asInlineFragment() }

                /// Post.EditorState.Root.Child.AsHeadingNode.Child.AsLinebreakNode
                ///
                /// Parent Type: `LinebreakNode`
                nonisolated public struct AsLinebreakNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_linebreakNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child.AsLinebreakNode.self,
                    TextNodes_linebreakNode.self
                  ] }

                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_linebreakNode: TextNodes_linebreakNode { _toFragment() }
                  }
                }

                /// Post.EditorState.Root.Child.AsHeadingNode.Child.AsTextNode
                ///
                /// Parent Type: `TextNode`
                nonisolated public struct AsTextNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_textNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child.AsTextNode.self,
                    TextNodes_textNode.self
                  ] }

                  public var format: Int? { __data["format"] }
                  public var text: String? { __data["text"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_textNode: TextNodes_textNode { _toFragment() }
                  }
                }
              }
            }

            /// Post.EditorState.Root.Child.AsImageNode
            ///
            /// Parent Type: `ImageNode`
            nonisolated public struct AsImageNode: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ImageNode }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("image", Image?.self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostQuery.Data.Post.EditorState.Root.Child.self,
                PostQuery.Data.Post.EditorState.Root.Child.AsImageNode.self
              ] }

              public var image: Image? { __data["image"] }

              /// Post.EditorState.Root.Child.AsImageNode.Image
              ///
              /// Parent Type: `ImageUpload`
              nonisolated public struct Image: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUpload }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .field("id", String.self),
                  .field("altText", String?.self),
                  .field("destination", String.self),
                  .field("crops", [Crop].self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostQuery.Data.Post.EditorState.Root.Child.AsImageNode.Image.self
                ] }

                public var id: String { __data["id"] }
                public var altText: String? { __data["altText"] }
                public var destination: String { __data["destination"] }
                public var crops: [Crop] { __data["crops"] }

                /// Post.EditorState.Root.Child.AsImageNode.Image.Crop
                ///
                /// Parent Type: `ImageUploadCrop`
                nonisolated public struct Crop: HighForThisAPI.SelectionSet {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUploadCrop }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .field("__typename", String.self),
                    .field("fileName", String.self),
                    .field("height", Int.self),
                    .field("width", Int.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsImageNode.Image.Crop.self
                  ] }

                  public var fileName: String { __data["fileName"] }
                  public var height: Int { __data["height"] }
                  public var width: Int { __data["width"] }
                }
              }
            }

            /// Post.EditorState.Root.Child.AsVideoNode
            ///
            /// Parent Type: `VideoNode`
            nonisolated public struct AsVideoNode: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.VideoNode }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("video", Video?.self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostQuery.Data.Post.EditorState.Root.Child.self,
                PostQuery.Data.Post.EditorState.Root.Child.AsVideoNode.self
              ] }

              public var video: Video? { __data["video"] }

              /// Post.EditorState.Root.Child.AsVideoNode.Video
              ///
              /// Parent Type: `Video`
              nonisolated public struct Video: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Video }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .fragment(Video_video.self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostQuery.Data.Post.EditorState.Root.Child.AsVideoNode.Video.self,
                  Video_video.self
                ] }

                public var id: String { __data["id"] }
                public var dataId: String { __data["dataId"] }
                public var slug: String { __data["slug"] }
                public var title: String { __data["title"] }
                public var thumbnails: [Thumbnail] { __data["thumbnails"] }

                public struct Fragments: FragmentContainer {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public var video_video: Video_video { _toFragment() }
                }

                public typealias Thumbnail = Video_video.Thumbnail
              }
            }

            /// Post.EditorState.Root.Child.AsElementNode
            ///
            /// Parent Type: `ElementNode`
            nonisolated public struct AsElementNode: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ElementNode }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("type", String?.self),
                .field("children", [Child?]?.self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostQuery.Data.Post.EditorState.Root.Child.self,
                PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.self
              ] }

              public var type: String? { __data["type"] }
              public var children: [Child?]? { __data["children"] }

              /// Post.EditorState.Root.Child.AsElementNode.Child
              ///
              /// Parent Type: `EditorNode`
              nonisolated public struct Child: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .inlineFragment(AsLinebreakNode.self),
                  .inlineFragment(AsTextNode.self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child.self
                ] }

                public var asLinebreakNode: AsLinebreakNode? { _asInlineFragment() }
                public var asTextNode: AsTextNode? { _asInlineFragment() }

                /// Post.EditorState.Root.Child.AsElementNode.Child.AsLinebreakNode
                ///
                /// Parent Type: `LinebreakNode`
                nonisolated public struct AsLinebreakNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_linebreakNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child.AsLinebreakNode.self,
                    TextNodes_linebreakNode.self
                  ] }

                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_linebreakNode: TextNodes_linebreakNode { _toFragment() }
                  }
                }

                /// Post.EditorState.Root.Child.AsElementNode.Child.AsTextNode
                ///
                /// Parent Type: `TextNode`
                nonisolated public struct AsTextNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_textNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child.AsTextNode.self,
                    TextNodes_textNode.self
                  ] }

                  public var format: Int? { __data["format"] }
                  public var text: String? { __data["text"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_textNode: TextNodes_textNode { _toFragment() }
                  }
                }
              }
            }

            /// Post.EditorState.Root.Child.AsQuoteNode
            ///
            /// Parent Type: `QuoteNode`
            nonisolated public struct AsQuoteNode: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.QuoteNode }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("children", [Child?]?.self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostQuery.Data.Post.EditorState.Root.Child.self,
                PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.self
              ] }

              public var children: [Child?]? { __data["children"] }

              /// Post.EditorState.Root.Child.AsQuoteNode.Child
              ///
              /// Parent Type: `EditorNode`
              nonisolated public struct Child: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .inlineFragment(AsLinebreakNode.self),
                  .inlineFragment(AsTextNode.self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child.self
                ] }

                public var asLinebreakNode: AsLinebreakNode? { _asInlineFragment() }
                public var asTextNode: AsTextNode? { _asInlineFragment() }

                /// Post.EditorState.Root.Child.AsQuoteNode.Child.AsLinebreakNode
                ///
                /// Parent Type: `LinebreakNode`
                nonisolated public struct AsLinebreakNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_linebreakNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child.AsLinebreakNode.self,
                    TextNodes_linebreakNode.self
                  ] }

                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_linebreakNode: TextNodes_linebreakNode { _toFragment() }
                  }
                }

                /// Post.EditorState.Root.Child.AsQuoteNode.Child.AsTextNode
                ///
                /// Parent Type: `TextNode`
                nonisolated public struct AsTextNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_textNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child.AsTextNode.self,
                    TextNodes_textNode.self
                  ] }

                  public var format: Int? { __data["format"] }
                  public var text: String? { __data["text"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_textNode: TextNodes_textNode { _toFragment() }
                  }
                }
              }
            }

            /// Post.EditorState.Root.Child.AsCodeNode
            ///
            /// Parent Type: `CodeNode`
            nonisolated public struct AsCodeNode: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.CodeNode }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("children", [Child?]?.self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostQuery.Data.Post.EditorState.Root.Child.self,
                PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.self
              ] }

              public var children: [Child?]? { __data["children"] }

              /// Post.EditorState.Root.Child.AsCodeNode.Child
              ///
              /// Parent Type: `EditorNode`
              nonisolated public struct Child: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Unions.EditorNode }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .inlineFragment(AsLinebreakNode.self),
                  .inlineFragment(AsTextNode.self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child.self
                ] }

                public var asLinebreakNode: AsLinebreakNode? { _asInlineFragment() }
                public var asTextNode: AsTextNode? { _asInlineFragment() }

                /// Post.EditorState.Root.Child.AsCodeNode.Child.AsLinebreakNode
                ///
                /// Parent Type: `LinebreakNode`
                nonisolated public struct AsLinebreakNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_linebreakNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child.AsLinebreakNode.self,
                    TextNodes_linebreakNode.self
                  ] }

                  public var type: String? { __data["type"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_linebreakNode: TextNodes_linebreakNode { _toFragment() }
                  }
                }

                /// Post.EditorState.Root.Child.AsCodeNode.Child.AsTextNode
                ///
                /// Parent Type: `TextNode`
                nonisolated public struct AsTextNode: HighForThisAPI.InlineFragment {
                  @_spi(Unsafe) public let __data: DataDict
                  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                  public typealias RootEntityType = PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child
                  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
                  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                    .fragment(TextNodes_textNode.self),
                  ] }
                  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                    PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child.self,
                    PostQuery.Data.Post.EditorState.Root.Child.AsCodeNode.Child.AsTextNode.self,
                    TextNodes_textNode.self
                  ] }

                  public var format: Int? { __data["format"] }
                  public var text: String? { __data["text"] }

                  public struct Fragments: FragmentContainer {
                    @_spi(Unsafe) public let __data: DataDict
                    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                    public var textNodes_textNode: TextNodes_textNode { _toFragment() }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
