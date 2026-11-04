// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ShowEdge: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ShowEdge
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ShowEdge>>

  public struct MockFields: Sendable {
    @Field<Show>("node") public var node
  }
}

public extension Mock where O == ShowEdge {
  convenience init(
    node: Mock<Show> = Mock<Show>()
  ) {
    self.init()
    _setEntity(node, for: \.node)
  }
}
