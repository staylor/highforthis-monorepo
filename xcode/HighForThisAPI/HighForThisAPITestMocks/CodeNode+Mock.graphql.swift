// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class CodeNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.CodeNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<CodeNode>>

  public struct MockFields: Sendable {
    @Field<GraphQLEnum<HighForThisAPI.ElementDirection>>("direction") public var direction
    @Field<Int>("format") public var format
    @Field<Int>("indent") public var indent
    @Field<String>("type") public var type
    @Field<Int>("version") public var version
  }
}

public extension Mock where O == CodeNode {
  convenience init(
    direction: GraphQLEnum<HighForThisAPI.ElementDirection>? = nil,
    format: Int? = nil,
    indent: Int? = nil,
    type: String? = nil,
    version: Int? = nil
  ) {
    self.init()
    _setScalar(direction, for: \.direction)
    _setScalar(format, for: \.format)
    _setScalar(indent, for: \.indent)
    _setScalar(type, for: \.type)
    _setScalar(version, for: \.version)
  }
}
