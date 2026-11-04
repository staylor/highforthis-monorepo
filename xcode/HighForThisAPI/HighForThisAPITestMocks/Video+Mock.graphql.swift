// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Video: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Video
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Video>>

  public struct MockFields: Sendable {
    @Field<String>("dataId") public var dataId
    @Field<String>("id") public var id
    @Field<String>("slug") public var slug
    @Field<[VideoThumbnail]>("thumbnails") public var thumbnails
    @Field<String>("title") public var title
  }
}

public extension Mock where O == Video {
  convenience init(
    dataId: String = "",
    id: String = "",
    slug: String = "",
    thumbnails: [Mock<VideoThumbnail>] = [],
    title: String = ""
  ) {
    self.init()
    _setScalar(dataId, for: \.dataId)
    _setScalar(id, for: \.id)
    _setScalar(slug, for: \.slug)
    _setList(thumbnails, for: \.thumbnails)
    _setScalar(title, for: \.title)
  }
}
