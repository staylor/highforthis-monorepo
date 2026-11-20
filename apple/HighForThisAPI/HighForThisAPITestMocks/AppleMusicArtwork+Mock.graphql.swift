// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class AppleMusicArtwork: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.AppleMusicArtwork
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<AppleMusicArtwork>>

  public struct MockFields: Sendable {
    @Field<Int>("height") public var height
    @Field<String>("url") public var url
    @Field<Int>("width") public var width
  }
}

public extension Mock where O == AppleMusicArtwork {
  convenience init(
    height: Int? = nil,
    url: String? = nil,
    width: Int? = nil
  ) {
    self.init()
    _setScalar(height, for: \.height)
    _setScalar(url, for: \.url)
    _setScalar(width, for: \.width)
  }
}
