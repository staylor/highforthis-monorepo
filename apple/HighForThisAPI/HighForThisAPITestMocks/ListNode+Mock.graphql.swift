// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ListNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ListNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ListNode>>

  public struct MockFields: Sendable {
    @Field<[EditorNode?]>("children") public var children
    @Field<GraphQLEnum<HighForThisAPI.ListType>>("listType") public var listType
    @Field<Int>("start") public var start
    @Field<String>("type") public var type
  }
}

public extension Mock where O == ListNode {
  convenience init(
    children: [(any AnyMock)?]? = nil,
    listType: GraphQLEnum<HighForThisAPI.ListType>? = nil,
    start: Int? = nil,
    type: String? = nil
  ) {
    self.init()
    _setList(children, for: \.children)
    _setScalar(listType, for: \.listType)
    _setScalar(start, for: \.start)
    _setScalar(type, for: \.type)
  }
}
