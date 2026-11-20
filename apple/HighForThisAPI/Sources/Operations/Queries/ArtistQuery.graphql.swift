// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct ArtistQuery: GraphQLQuery {
  public static let operationName: String = "Artist"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Artist($slug: String!) { artist(slug: $slug) { __typename id name slug website appleMusic { __typename id url artwork { __typename height url width } } } attended: shows(artist: { slug: $slug }, attended: true, first: 5) { __typename count edges { __typename node { __typename ...ShowList_show } } pageInfo { __typename hasNextPage } } shows(artist: { slug: $slug }, first: 5, latest: true) { __typename edges { __typename node { __typename ...ShowList_show } } pageInfo { __typename hasNextPage } } }"#,
      fragments: [ShowList_show.self]
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
      .field("artist", Artist?.self, arguments: ["slug": .variable("slug")]),
      .field("shows", alias: "attended", Attended?.self, arguments: [
        "artist": ["slug": .variable("slug")],
        "attended": true,
        "first": 5
      ]),
      .field("shows", Shows?.self, arguments: [
        "artist": ["slug": .variable("slug")],
        "first": 5,
        "latest": true
      ]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      ArtistQuery.Data.self
    ] }

    public var artist: Artist? { __data["artist"] }
    public var attended: Attended? { __data["attended"] }
    public var shows: Shows? { __data["shows"] }

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
        .field("website", String?.self),
        .field("appleMusic", AppleMusic?.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ArtistQuery.Data.Artist.self
      ] }

      public var id: String { __data["id"] }
      public var name: String { __data["name"] }
      public var slug: String { __data["slug"] }
      public var website: String? { __data["website"] }
      public var appleMusic: AppleMusic? { __data["appleMusic"] }

      /// Artist.AppleMusic
      ///
      /// Parent Type: `AppleMusicData`
      nonisolated public struct AppleMusic: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicData }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String?.self),
          .field("url", String?.self),
          .field("artwork", Artwork?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          ArtistQuery.Data.Artist.AppleMusic.self
        ] }

        public var id: String? { __data["id"] }
        public var url: String? { __data["url"] }
        public var artwork: Artwork? { __data["artwork"] }

        /// Artist.AppleMusic.Artwork
        ///
        /// Parent Type: `AppleMusicArtwork`
        nonisolated public struct Artwork: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.AppleMusicArtwork }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .field("height", Int?.self),
            .field("url", String?.self),
            .field("width", Int?.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            ArtistQuery.Data.Artist.AppleMusic.Artwork.self
          ] }

          public var height: Int? { __data["height"] }
          public var url: String? { __data["url"] }
          public var width: Int? { __data["width"] }
        }
      }
    }

    /// Attended
    ///
    /// Parent Type: `ShowConnection`
    nonisolated public struct Attended: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("count", Int?.self),
        .field("edges", [Edge].self),
        .field("pageInfo", PageInfo.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ArtistQuery.Data.Attended.self
      ] }

      public var count: Int? { __data["count"] }
      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      /// Attended.Edge
      ///
      /// Parent Type: `ShowEdge`
      nonisolated public struct Edge: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowEdge }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          ArtistQuery.Data.Attended.Edge.self
        ] }

        public var node: Node { __data["node"] }

        /// Attended.Edge.Node
        ///
        /// Parent Type: `Show`
        nonisolated public struct Node: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .fragment(ShowList_show.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            ArtistQuery.Data.Attended.Edge.Node.self,
            ShowList_show.self
          ] }

          public var id: String { __data["id"] }
          public var date: Double { __data["date"] }
          public var title: String? { __data["title"] }
          public var artists: [Artist] { __data["artists"] }
          public var venue: Venue { __data["venue"] }

          public struct Fragments: FragmentContainer {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            public var showList_show: ShowList_show { _toFragment() }
          }

          public typealias Artist = ShowList_show.Artist

          public typealias Venue = ShowList_show.Venue
        }
      }

      /// Attended.PageInfo
      ///
      /// Parent Type: `PageInfo`
      nonisolated public struct PageInfo: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PageInfo }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("hasNextPage", Bool?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          ArtistQuery.Data.Attended.PageInfo.self
        ] }

        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }

    /// Shows
    ///
    /// Parent Type: `ShowConnection`
    nonisolated public struct Shows: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
        .field("pageInfo", PageInfo.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        ArtistQuery.Data.Shows.self
      ] }

      public var edges: [Edge] { __data["edges"] }
      public var pageInfo: PageInfo { __data["pageInfo"] }

      /// Shows.Edge
      ///
      /// Parent Type: `ShowEdge`
      nonisolated public struct Edge: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.ShowEdge }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          ArtistQuery.Data.Shows.Edge.self
        ] }

        public var node: Node { __data["node"] }

        /// Shows.Edge.Node
        ///
        /// Parent Type: `Show`
        nonisolated public struct Node: HighForThisAPI.SelectionSet {
          @_spi(Unsafe) public let __data: DataDict
          @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

          @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
          @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .fragment(ShowList_show.self),
          ] }
          @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
            ArtistQuery.Data.Shows.Edge.Node.self,
            ShowList_show.self
          ] }

          public var id: String { __data["id"] }
          public var date: Double { __data["date"] }
          public var title: String? { __data["title"] }
          public var artists: [Artist] { __data["artists"] }
          public var venue: Venue { __data["venue"] }

          public struct Fragments: FragmentContainer {
            @_spi(Unsafe) public let __data: DataDict
            @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

            public var showList_show: ShowList_show { _toFragment() }
          }

          public typealias Artist = ShowList_show.Artist

          public typealias Venue = ShowList_show.Venue
        }
      }

      /// Shows.PageInfo
      ///
      /// Parent Type: `PageInfo`
      nonisolated public struct PageInfo: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.PageInfo }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("hasNextPage", Bool?.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          ArtistQuery.Data.Shows.PageInfo.self
        ] }

        public var hasNextPage: Bool? { __data["hasNextPage"] }
      }
    }
  }
}
