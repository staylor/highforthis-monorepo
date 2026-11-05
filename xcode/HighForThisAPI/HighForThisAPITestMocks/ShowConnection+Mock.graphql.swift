// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ShowConnection: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ShowConnection
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ShowConnection>>

  public struct MockFields: Sendable {
    @Field<Int>("count") public var count
    @Field<[ShowEdge]>("edges") public var edges
    @Field<PageInfo>("pageInfo") public var pageInfo
    @Field<[Int]>("years") public var years
  }
}

public extension Mock where O == ShowConnection {
  convenience init(
    count: Int? = nil,
    edges: [Mock<ShowEdge>] = [],
    pageInfo: Mock<PageInfo> = Mock<PageInfo>(),
    years: [Int]? = nil
  ) {
    self.init()
    _setScalar(count, for: \.count)
    _setList(edges, for: \.edges)
    _setEntity(pageInfo, for: \.pageInfo)
    _setScalarList(years, for: \.years)
  }
}
