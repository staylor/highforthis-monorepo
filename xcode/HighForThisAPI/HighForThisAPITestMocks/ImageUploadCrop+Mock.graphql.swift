// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ImageUploadCrop: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ImageUploadCrop
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ImageUploadCrop>>

  public struct MockFields: Sendable {
    @Field<String>("fileName") public var fileName
    @Field<Int>("height") public var height
    @Field<Int>("width") public var width
  }
}

public extension Mock where O == ImageUploadCrop {
  convenience init(
    fileName: String = "",
    height: Int = 0,
    width: Int = 0
  ) {
    self.init()
    _setScalar(fileName, for: \.fileName)
    _setScalar(height, for: \.height)
    _setScalar(width, for: \.width)
  }
}
