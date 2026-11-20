// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class PodcastConnection: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.PodcastConnection
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<PodcastConnection>>

  public struct MockFields: Sendable {
    @Field<[PodcastEdge]>("edges") public var edges
    @Field<PageInfo>("pageInfo") public var pageInfo
  }
}

public extension Mock where O == PodcastConnection {
  convenience init(
    edges: [Mock<PodcastEdge>] = [],
    pageInfo: Mock<PageInfo> = Mock<PageInfo>()
  ) {
    self.init()
    _setList(edges, for: \.edges)
    _setEntity(pageInfo, for: \.pageInfo)
  }
}
