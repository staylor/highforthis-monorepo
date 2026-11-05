// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class HeadingNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.HeadingNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<HeadingNode>>

  public struct MockFields: Sendable {
    @Field<[EditorNode?]>("children") public var children
    @Field<GraphQLEnum<HighForThisAPI.HeadingTag>>("tag") public var tag
  }
}

public extension Mock where O == HeadingNode {
  convenience init(
    children: [(any AnyMock)?]? = nil,
    tag: GraphQLEnum<HighForThisAPI.HeadingTag>? = nil
  ) {
    self.init()
    _setList(children, for: \.children)
    _setScalar(tag, for: \.tag)
  }
}
