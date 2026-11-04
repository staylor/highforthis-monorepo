// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct VideosQuery: GraphQLQuery {
  public static let operationName: String = "Videos"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Videos($after: String, $first: Int, $year: Int) { videos(after: $after, first: $first, year: $year) { __typename years edges { __typename cursor node { __typename ...Video_video } } pageInfo { __typename hasNextPage hasPreviousPage } } }"#,
      fragments: [Video_video.self]
    ))

  public var after: GraphQLNullable<String>
  public var first: GraphQLNullable<Int32>
  public var year: GraphQLNullable<Int32>

  public init(
    after: GraphQLNullable<String>,
    first: GraphQLNullable<Int32>,
    year: GraphQLNullable<Int32>
  ) {
    self.after = after
    self.first = first
    self.year = year
  }

  @_spi(Unsafe) public var __variables: Variables? { [
    "after": after,
    "first": first,
    "year": year
  ] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("videos", Videos?.self, arguments: [
        "after": .variable("after"),
        "first": .variable("first"),
        "year": .variable("year")
      ]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      VideosQuery.Data.self
    ] }

    public var videos: Videos? { __data["videos"] }

    /// Videos
    ///
    /// Parent Type: `VideoConnection`
    nonisolated public struct Videos: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.VideoConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("years", [Int]?.self),
        .field("edges", [Edge].self),
        .field("pageInfo", PageInfo.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        VideosQuery.Data.Videos.self
      ] }

      public var years: [Int]? { __data["years"] }
      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      /// Videos.Edge
      ///
      /// Parent Type: `VideoEdge`
      nonisolated public struct Edge: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.VideoEdge }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("cursor", String.self),
          .field("node", Node.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          VideosQuery.Data.Videos.Edge.self
        ] }

        public var cursor: String { __data["cursor"] }
        public var node: Node { __data["node"] }

        /// Videos.Edge.Node
        ///
        /// Parent Type: `Video`
        nonisolated public struct Node: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Video }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .fragment(Video_video.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            VideosQuery.Data.Videos.Edge.Node.self,
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

      /// Videos.PageInfo
      ///
      /// Parent Type: `PageInfo`
      nonisolated public struct PageInfo: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PageInfo }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("hasNextPage", Bool?.self),
          .field("hasPreviousPage", Bool?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          VideosQuery.Data.Videos.PageInfo.self
        ] }

        public var hasNextPage: Bool? { __data["hasNextPage"] }
        public var hasPreviousPage: Bool? { __data["hasPreviousPage"] }
      }
    }
  }
}
