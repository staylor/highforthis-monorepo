// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class PostConnection: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.PostConnection
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<PostConnection>>

  public struct MockFields: Sendable {
    @Field<[PostEdge]>("edges") public var edges
  }
}

public extension Mock where O == PostConnection {
  convenience init(
    edges: [Mock<PostEdge>] = []
  ) {
    self.init()
    _setList(edges, for: \.edges)
  }
}
