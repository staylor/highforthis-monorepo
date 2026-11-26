// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoNode>>

  public struct MockFields: Sendable {
    @Field<[EditorNode?]>("children") public var children
    @Field<String>("type") public var type
    @Field<Video>("video") public var video
  }
}

public extension Mock where O == VideoNode {
  convenience init(
    children: [(any AnyMock)?]? = nil,
    type: String? = nil,
    video: Mock<Video>? = nil
  ) {
    self.init()
    _setList(children, for: \.children)
    _setScalar(type, for: \.type)
    _setEntity(video, for: \.video)
  }
}
