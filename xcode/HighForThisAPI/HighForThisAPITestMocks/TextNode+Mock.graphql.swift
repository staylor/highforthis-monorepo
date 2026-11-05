// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class TextNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.TextNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<TextNode>>

  public struct MockFields: Sendable {
    @Field<Int>("format") public var format
    @Field<String>("text") public var text
  }
}

public extension Mock where O == TextNode {
  convenience init(
    format: Int? = nil,
    text: String? = nil
  ) {
    self.init()
    _setScalar(format, for: \.format)
    _setScalar(text, for: \.text)
  }
}
