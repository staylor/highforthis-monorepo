// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ImageNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ImageNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ImageNode>>

  public struct MockFields: Sendable {
    @Field<ImageUpload>("image") public var image
  }
}

public extension Mock where O == ImageNode {
  convenience init(
    image: Mock<ImageUpload>? = nil
  ) {
    self.init()
    _setEntity(image, for: \.image)
  }
}
