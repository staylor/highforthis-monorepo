// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class AppleMusicData: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.AppleMusicData
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<AppleMusicData>>

  public struct MockFields: Sendable {
    @Field<AppleMusicArtwork>("artwork") public var artwork
    @Field<String>("id") public var id
    @Field<String>("url") public var url
  }
}

public extension Mock where O == AppleMusicData {
  convenience init(
    artwork: Mock<AppleMusicArtwork>? = nil,
    id: String? = nil,
    url: String? = nil
  ) {
    self.init()
    _setEntity(artwork, for: \.artwork)
    _setScalar(id, for: \.id)
    _setScalar(url, for: \.url)
  }
}
