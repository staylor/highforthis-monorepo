// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class EditorState: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.EditorState
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<EditorState>>

  public struct MockFields: Sendable {
    @Field<ElementNode>("root") public var root
  }
}

public extension Mock where O == EditorState {
  convenience init(
    root: Mock<ElementNode>? = nil
  ) {
    self.init()
    _setEntity(root, for: \.root)
  }
}
