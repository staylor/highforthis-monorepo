// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class AudioUpload: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.AudioUpload
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<AudioUpload>>

  public struct MockFields: Sendable {
    @Field<String>("destination") public var destination
    @Field<Double>("duration") public var duration
    @Field<String>("fileName") public var fileName
    @Field<String>("id") public var id
  }
}

public extension Mock where O == AudioUpload {
  convenience init(
    destination: String = "",
    duration: Double? = nil,
    fileName: String = "",
    id: String = ""
  ) {
    self.init()
    _setScalar(destination, for: \.destination)
    _setScalar(duration, for: \.duration)
    _setScalar(fileName, for: \.fileName)
    _setScalar(id, for: \.id)
  }
}
