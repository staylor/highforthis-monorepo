// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VideoConnection: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VideoConnection
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VideoConnection>>

  public struct MockFields: Sendable {
    @Field<[VideoEdge]>("edges") public var edges
    @Field<PageInfo>("pageInfo") public var pageInfo
    @Field<[Int]>("years") public var years
  }
}

public extension Mock where O == VideoConnection {
  convenience init(
    edges: [Mock<VideoEdge>] = [],
    pageInfo: Mock<PageInfo> = Mock<PageInfo>(),
    years: [Int]? = nil
  ) {
    self.init()
    _setList(edges, for: \.edges)
    _setEntity(pageInfo, for: \.pageInfo)
    _setScalarList(years, for: \.years)
  }
}
