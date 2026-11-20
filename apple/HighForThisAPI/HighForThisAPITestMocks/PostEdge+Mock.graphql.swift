// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class PostEdge: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.PostEdge
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<PostEdge>>

  public struct MockFields: Sendable {
    @Field<Post>("node") public var node
  }
}

public extension Mock where O == PostEdge {
  convenience init(
    node: Mock<Post> = Mock<Post>()
  ) {
    self.init()
    _setEntity(node, for: \.node)
  }
}
