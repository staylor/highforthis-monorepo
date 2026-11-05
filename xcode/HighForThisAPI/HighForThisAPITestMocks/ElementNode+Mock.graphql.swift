// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ElementNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ElementNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ElementNode>>

  public struct MockFields: Sendable {
    @Field<[EditorNode?]>("children") public var children
    @Field<String>("type") public var type
  }
}

public extension Mock where O == ElementNode {
  convenience init(
    children: [(any AnyMock)?]? = nil,
    type: String? = nil
  ) {
    self.init()
    _setList(children, for: \.children)
    _setScalar(type, for: \.type)
  }
}
