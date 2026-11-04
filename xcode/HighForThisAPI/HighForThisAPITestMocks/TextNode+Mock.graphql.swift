// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class TextNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.TextNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<TextNode>>

  public struct MockFields: Sendable {
    @Field<Int>("detail") public var detail
    @Field<Int>("format") public var format
    @Field<GraphQLEnum<HighForThisAPI.TextModeType>>("mode") public var mode
    @Field<String>("style") public var style
    @Field<String>("text") public var text
    @Field<Int>("textFormat") public var textFormat
    @Field<String>("textStyle") public var textStyle
    @Field<String>("type") public var type
  }
}

public extension Mock where O == TextNode {
  convenience init(
    detail: Int? = nil,
    format: Int? = nil,
    mode: GraphQLEnum<HighForThisAPI.TextModeType>? = nil,
    style: String? = nil,
    text: String? = nil,
    textFormat: Int? = nil,
    textStyle: String? = nil,
    type: String? = nil
  ) {
    self.init()
    _setScalar(detail, for: \.detail)
    _setScalar(format, for: \.format)
    _setScalar(mode, for: \.mode)
    _setScalar(style, for: \.style)
    _setScalar(text, for: \.text)
    _setScalar(textFormat, for: \.textFormat)
    _setScalar(textStyle, for: \.textStyle)
    _setScalar(type, for: \.type)
  }
}
