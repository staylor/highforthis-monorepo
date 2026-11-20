// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class QuoteNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.QuoteNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<QuoteNode>>

  public struct MockFields: Sendable {
    @Field<[EditorNode?]>("children") public var children
  }
}

public extension Mock where O == QuoteNode {
  convenience init(
    children: [(any AnyMock)?]? = nil
  ) {
    self.init()
    _setList(children, for: \.children)
  }
}
