// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class PodcastEdge: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.PodcastEdge
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<PodcastEdge>>

  public struct MockFields: Sendable {
    @Field<Podcast>("node") public var node
  }
}

public extension Mock where O == PodcastEdge {
  convenience init(
    node: Mock<Podcast> = Mock<Podcast>()
  ) {
    self.init()
    _setEntity(node, for: \.node)
  }
}
