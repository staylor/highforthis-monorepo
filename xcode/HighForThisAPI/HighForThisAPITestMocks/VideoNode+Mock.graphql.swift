// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoNode>>

  public struct MockFields: Sendable {
    @Field<Video>("video") public var video
  }
}

public extension Mock where O == VideoNode {
  convenience init(
    video: Mock<Video>? = nil
  ) {
    self.init()
    _setEntity(video, for: \.video)
  }
}
