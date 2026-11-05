// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ImageUpload: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ImageUpload
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ImageUpload>>

  public struct MockFields: Sendable {
    @Field<String>("altText") public var altText
    @Field<[ImageUploadCrop]>("crops") public var crops
    @Field<String>("destination") public var destination
    @Field<String>("id") public var id
  }
}

public extension Mock where O == ImageUpload {
  convenience init(
    altText: String? = nil,
    crops: [Mock<ImageUploadCrop>] = [],
    destination: String = "",
    id: String = ""
  ) {
    self.init()
    _setScalar(altText, for: \.altText)
    _setList(crops, for: \.crops)
    _setScalar(destination, for: \.destination)
    _setScalar(id, for: \.id)
  }
}
