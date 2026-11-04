// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoNode: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoNode
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoNode>>

  public struct MockFields: Sendable {
    @Field<GraphQLEnum<HighForThisAPI.ElementDirection>>("direction") public var direction
    @Field<Int>("format") public var format
    @Field<Int>("indent") public var indent
    @Field<String>("type") public var type
    @Field<Int>("version") public var version
    @Field<Video>("video") public var video
  }
}

public extension Mock where O == VideoNode {
  convenience init(
    direction: GraphQLEnum<HighForThisAPI.ElementDirection>? = nil,
    format: Int? = nil,
    indent: Int? = nil,
    type: String? = nil,
    version: Int? = nil,
    video: Mock<Video>? = nil
  ) {
    self.init()
    _setScalar(direction, for: \.direction)
    _setScalar(format, for: \.format)
    _setScalar(indent, for: \.indent)
    _setScalar(type, for: \.type)
    _setScalar(version, for: \.version)
    _setEntity(video, for: \.video)
  }
}
