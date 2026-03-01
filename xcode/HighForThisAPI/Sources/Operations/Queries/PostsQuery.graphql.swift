// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class PostsQuery: GraphQLQuery {
  public static let operationName: String = "Posts"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Posts { posts(first: 20, status: PUBLISH) { __typename edges { __typename node { __typename id slug summary title featuredMedia { __typename id destination ... on ImageUpload { crops { __typename fileName width } } } } } } }"#
    ))

  public init() {}

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("posts", Posts?.self, arguments: [
        "first": 20,
        "status": "PUBLISH"
      ]),
    ] }

    public var posts: Posts? { __data["posts"] }

    /// Posts
    ///
    /// Parent Type: `PostConnection`
    public struct Posts: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.PostConnection }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
      ] }

      public var edges: [Edge] { __data["edges"] }

      /// Posts.Edge
      ///
      /// Parent Type: `PostEdge`
      public struct Edge: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.PostEdge }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }

        public var node: Node { __data["node"] }

        /// Posts.Edge.Node
        ///
        /// Parent Type: `Post`
        public struct Node: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Post }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("id", String.self),
            .field("slug", String.self),
            .field("summary", String?.self),
            .field("title", String.self),
            .field("featuredMedia", [FeaturedMedium]?.self),
          ] }

          public var id: String { __data["id"] }
          public var slug: String { __data["slug"] }
          public var summary: String? { __data["summary"] }
          public var title: String { __data["title"] }
          public var featuredMedia: [FeaturedMedium]? { __data["featuredMedia"] }

          /// Posts.Edge.Node.FeaturedMedium
          ///
          /// Parent Type: `MediaUpload`
          public struct FeaturedMedium: HighForThisAPI.SelectionSet {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Interfaces.MediaUpload }
            public static var __selections: [ApolloAPI.Selection] { [
              .field("__typename", String.self),
              .field("id", String.self),
              .field("destination", String.self),
              .inlineFragment(AsImageUpload.self),
            ] }

            public var id: String { __data["id"] }
            public var destination: String { __data["destination"] }

            public var asImageUpload: AsImageUpload? { _asInlineFragment() }

            /// Posts.Edge.Node.FeaturedMedium.AsImageUpload
            ///
            /// Parent Type: `ImageUpload`
            public struct AsImageUpload: HighForThisAPI.InlineFragment {
              public let __data: DataDict
              public init(_dataDict: DataDict) { __data = _dataDict }

              public typealias RootEntityType = PostsQuery.Data.Posts.Edge.Node.FeaturedMedium
              public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ImageUpload }
              public static var __selections: [ApolloAPI.Selection] { [
                .field("crops", [Crop].self),
              ] }

              public var crops: [Crop] { __data["crops"] }
              public var id: String { __data["id"] }
              public var destination: String { __data["destination"] }

              /// Posts.Edge.Node.FeaturedMedium.AsImageUpload.Crop
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
  }
}
