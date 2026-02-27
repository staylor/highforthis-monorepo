// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class PodcastQuery: GraphQLQuery {
  public static let operationName: String = "Podcast"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Podcast($id: String!) { podcast(id: $id) { __typename id date description title audio { __typename id destination duration fileName } } }"#
    ))

  public var id: String

  public init(id: String) {
    self.id = id
  }

  public var __variables: Variables? { ["id": id] }

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("podcast", Podcast?.self, arguments: ["id": .variable("id")]),
    ] }

    public var podcast: Podcast? { __data["podcast"] }

    /// Podcast
    ///
    /// Parent Type: `Podcast`
    public struct Podcast: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Podcast }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("id", String.self),
        .field("date", Double?.self),
        .field("description", String.self),
        .field("title", String.self),
        .field("audio", Audio?.self),
      ] }

      public var id: String { __data["id"] }
      public var date: Double? { __data["date"] }
      public var description: String { __data["description"] }
      public var title: String { __data["title"] }
      public var audio: Audio? { __data["audio"] }

      /// Podcast.Audio
      ///
      /// Parent Type: `AudioUpload`
      public struct Audio: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.AudioUpload }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("id", String.self),
          .field("destination", String.self),
          .field("duration", Double?.self),
          .field("fileName", String.self),
        ] }

        public var id: String { __data["id"] }
        public var destination: String { __data["destination"] }
        public var duration: Double? { __data["duration"] }
        public var fileName: String { __data["fileName"] }
      }
    }
  }
}
