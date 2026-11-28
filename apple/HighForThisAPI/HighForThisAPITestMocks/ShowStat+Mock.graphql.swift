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
    @Field<String>("firstLocalDate") public var firstLocalDate
    @Field<String>("lastLocalDate") public var lastLocalDate
  }
}

public extension Mock where O == ShowStat {
  convenience init(
    count: Int = 0,
    entity: (any AnyMock) = Mock<Artist>(),
    firstLocalDate: String = "",
    lastLocalDate: String = ""
  ) {
    self.init()
    _setScalar(count, for: \.count)
    _setEntity(entity, for: \.entity)
    _setScalar(firstLocalDate, for: \.firstLocalDate)
    _setScalar(lastLocalDate, for: \.lastLocalDate)
  }
}
