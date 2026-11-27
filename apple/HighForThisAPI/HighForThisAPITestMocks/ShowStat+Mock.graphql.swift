// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ShowStat: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ShowStat
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ShowStat>>

  public struct MockFields: Sendable {
    @Field<Int>("count") public var count
    @Field<ShowEntity>("entity") public var entity
    @Field<Double>("firstDate") public var firstDate
    @Field<Double>("lastDate") public var lastDate
  }
}

public extension Mock where O == ShowStat {
  convenience init(
    count: Int = 0,
    entity: (any AnyMock) = Mock<Artist>(),
    firstDate: Double = 0.0,
    lastDate: Double = 0.0
  ) {
    self.init()
    _setScalar(count, for: \.count)
    _setEntity(entity, for: \.entity)
    _setScalar(firstDate, for: \.firstDate)
    _setScalar(lastDate, for: \.lastDate)
  }
}
