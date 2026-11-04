// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoEdge: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoEdge
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoEdge>>

  public struct MockFields: Sendable {
    @Field<String>("cursor") public var cursor
    @Field<Video>("node") public var node
  }
}

public extension Mock where O == VideoEdge {
  convenience init(
    cursor: String = "",
    node: Mock<Video> = Mock<Video>()
  ) {
    self.init()
    _setScalar(cursor, for: \.cursor)
    _setEntity(node, for: \.node)
  }
}
