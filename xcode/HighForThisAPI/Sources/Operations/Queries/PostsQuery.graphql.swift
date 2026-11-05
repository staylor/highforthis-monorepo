// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct PostsQuery: GraphQLQuery {
  public static let operationName: String = "Posts"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Posts($after: String, $first: Int!) { posts(after: $after, first: $first, status: PUBLISH) { __typename edges { __typename node { __typename id slug title featuredMedia { __typename id destination ... on ImageUpload { crops { __typename fileName width } } } } } pageInfo { __typename endCursor hasNextPage } } }"#
    ))

  public var after: GraphQLNullable<String>
  public var first: Int32

  public init(
    after: GraphQLNullable<String>,
    first: Int32
  ) {
    self.after = after
    self.first = first
  }

  @_spi(Unsafe) public var __variables: Variables? { [
    "after": after,
    "first": first
  ] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("posts", Posts?.self, arguments: [
        "after": .variable("after"),
        "first": .variable("first"),
        "status": "PUBLISH"
      ]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      PostsQuery.Data.self
    ] }

    public var posts: Posts? { __data["posts"] }

    /// Posts
    ///
    /// Parent Type: `PostConnection`
    nonisolated public struct Posts: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PostConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
        .field("pageInfo", PageInfo.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        PostsQuery.Data.Posts.self
      ] }

      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      /// Posts.Edge
      ///
      /// Parent Type: `PostEdge`
      nonisolated public struct Edge: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PostEdge }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          PostsQuery.Data.Posts.Edge.self
        ] }

        public var node: Node { __data["node"] }

        /// Posts.Edge.Node
        ///
        /// Parent Type: `Post`
        nonisolated public struct Node: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Post }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", String.self),
            .field("slug", String.self),
            .field("title", String.self),
            .field("featuredMedia", [FeaturedMedium]?.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            PostsQuery.Data.Posts.Edge.Node.self
          ] }

          public var id: String { __data["id"] }
          public var slug: String { __data["slug"] }
          public var title: String { __data["title"] }
          public var featuredMedia: [FeaturedMedium]? { __data["featuredMedia"] }

          /// Posts.Edge.Node.FeaturedMedium
          ///
          /// Parent Type: `MediaUpload`
          nonisolated public struct FeaturedMedium: HighForThisAPI.SelectionSet {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Interfaces.MediaUpload }
            @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("id", String.self),
              .field("destination", String.self),
              .inlineFragment(AsImageUpload.self),
            ] }
            @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
              PostsQuery.Data.Posts.Edge.Node.FeaturedMedium.self
            ] }

            public var id: String { __data["id"] }
            public var destination: String { __data["destination"] }

            public var asImageUpload: AsImageUpload? { _asInlineFragment() }

            /// Posts.Edge.Node.FeaturedMedium.AsImageUpload
            ///
            /// Parent Type: `ImageUpload`
            nonisolated public struct AsImageUpload: HighForThisAPI.InlineFragment {
              @_spi(Unsafe) public let __data: DataDict
              @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostsQuery.Data.Posts.Edge.Node.FeaturedMedium
              @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUpload }
              @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                .field("crops", [Crop].self),
              ] }
              @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                PostsQuery.Data.Posts.Edge.Node.FeaturedMedium.self,
                PostsQuery.Data.Posts.Edge.Node.FeaturedMedium.AsImageUpload.self
              ] }

              public var crops: [Crop] { __data["crops"] }
              public var id: String { __data["id"] }
              public var destination: String { __data["destination"] }

              /// Posts.Edge.Node.FeaturedMedium.AsImageUpload.Crop
              ///
              /// Parent Type: `ImageUploadCrop`
              nonisolated public struct Crop: HighForThisAPI.SelectionSet {
                @_spi(Unsafe) public let __data: DataDict
                @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

                @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUploadCrop }
                @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
                  .field("__typename", String.self),
                  .field("fileName", String.self),
                  .field("width", Int.self),
                ] }
                @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
                  PostsQuery.Data.Posts.Edge.Node.FeaturedMedium.AsImageUpload.Crop.self
                ] }

                public var fileName: String { __data["fileName"] }
                public var width: Int { __data["width"] }
              }
            }
          }
        }
      }

      /// Posts.PageInfo
      ///
      /// Parent Type: `PageInfo`
      nonisolated public struct PageInfo: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PageInfo }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("endCursor", String?.self),
          .field("hasNextPage", Bool?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          PostsQuery.Data.Posts.PageInfo.self
        ] }

        public var endCursor: String? { __data["endCursor"] }
        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }
  }
}
