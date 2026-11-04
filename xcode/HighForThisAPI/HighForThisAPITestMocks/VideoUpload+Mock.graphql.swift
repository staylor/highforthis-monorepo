// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoUpload: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoUpload
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoUpload>>

  public struct MockFields: Sendable {
    @Field<String>("destination") public var destination
    @Field<String>("id") public var id
  }
}

public extension Mock where O == VideoUpload {
  convenience init(
    destination: String = "",
    id: String = ""
  ) {
    self.init()
    _setScalar(destination, for: \.destination)
    _setScalar(id, for: \.id)
  }
}
