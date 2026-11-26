// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ImageNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ImageNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ImageNode>>

  public struct MockFields: Sendable {
    @Field<[EditorNode?]>("children") public var children
    @Field<ImageUpload>("image") public var image
    @Field<String>("type") public var type
  }
}

public extension Mock where O == ImageNode {
  convenience init(
    children: [(any AnyMock)?]? = nil,
    image: Mock<ImageUpload>? = nil,
    type: String? = nil
  ) {
    self.init()
    _setList(children, for: \.children)
    _setEntity(image, for: \.image)
    _setScalar(type, for: \.type)
  }
}
