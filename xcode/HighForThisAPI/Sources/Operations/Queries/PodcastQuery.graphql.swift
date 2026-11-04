// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct PodcastQuery: GraphQLQuery {
  public static let operationName: String = "Podcast"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Podcast($id: String!) { podcast(id: $id) { __typename id date description title audio { __typename id destination duration fileName } } }"#
    ))

  public var id: String

  public init(id: String) {
    self.id = id
  }

  @_spi(Unsafe) public var __variables: Variables? { ["id": id] }

  nonisolated public struct Data: HighForThisAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("podcast", Podcast?.self, arguments: ["id": .variable("id")]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      PodcastQuery.Data.self
    ] }

    public var podcast: Podcast? { __data["podcast"] }

    /// Podcast
    ///
    /// Parent Type: `Podcast`
    nonisolated public struct Podcast: HighForThisAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.Podcast }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", String.self),
        .field("date", Double?.self),
        .field("description", String.self),
        .field("title", String.self),
        .field("audio", Audio?.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        PodcastQuery.Data.Podcast.self
      ] }

      public var id: String { __data["id"] }
      public var date: Double? { __data["date"] }
      public var description: String { __data["description"] }
      public var title: String { __data["title"] }
      public var audio: Audio? { __data["audio"] }

      /// Podcast.Audio
      ///
      /// Parent Type: `AudioUpload`
      nonisolated public struct Audio: HighForThisAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.AudioUpload }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String.self),
          .field("destination", String.self),
          .field("duration", Double?.self),
          .field("fileName", String.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          PodcastQuery.Data.Podcast.Audio.self
        ] }

        public var id: String { __data["id"] }
        public var destination: String { __data["destination"] }
        public var duration: Double? { __data["duration"] }
        public var fileName: String { __data["fileName"] }
      }
    }
  }
}
