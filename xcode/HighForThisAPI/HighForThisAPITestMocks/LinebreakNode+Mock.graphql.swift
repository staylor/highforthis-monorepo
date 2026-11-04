// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class LinebreakNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.LinebreakNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<LinebreakNode>>

  public struct MockFields: Sendable {
    @Field<String>("type") public var type
  }
}

public extension Mock where O == LinebreakNode {
  convenience init(
    type: String? = nil
  ) {
    self.init()
    _setScalar(type, for: \.type)
  }
}
