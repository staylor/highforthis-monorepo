// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ImageNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ImageNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ImageNode>>

  public struct MockFields: Sendable {
    @Field<GraphQLEnum<HighForThisAPI.ElementDirection>>("direction") public var direction
    @Field<Int>("format") public var format
    @Field<ImageUpload>("image") public var image
    @Field<Int>("indent") public var indent
    @Field<String>("type") public var type
    @Field<Int>("version") public var version
  }
}

public extension Mock where O == ImageNode {
  convenience init(
    direction: GraphQLEnum<HighForThisAPI.ElementDirection>? = nil,
    format: Int? = nil,
    image: Mock<ImageUpload>? = nil,
    indent: Int? = nil,
    type: String? = nil,
    version: Int? = nil
  ) {
    self.init()
    _setScalar(direction, for: \.direction)
    _setScalar(format, for: \.format)
    _setEntity(image, for: \.image)
    _setScalar(indent, for: \.indent)
    _setScalar(type, for: \.type)
    _setScalar(version, for: \.version)
  }
}
