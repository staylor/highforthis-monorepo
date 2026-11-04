// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoThumbnail: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoThumbnail
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoThumbnail>>

  public struct MockFields: Sendable {
    @Field<Int>("height") public var height
    @Field<String>("url") public var url
    @Field<Int>("width") public var width
  }
}

public extension Mock where O == VideoThumbnail {
  convenience init(
    height: Int = 0,
    url: String = "",
    width: Int = 0
  ) {
    self.init()
    _setScalar(height, for: \.height)
    _setScalar(url, for: \.url)
    _setScalar(width, for: \.width)
  }
}
