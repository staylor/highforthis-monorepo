// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ShowSchedule: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ShowSchedule
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ShowSchedule>>

  public struct MockFields: Sendable {
    @Field<String>("localDate") public var localDate
    @Field<String>("localTime") public var localTime
  }
}

public extension Mock where O == ShowSchedule {
  convenience init(
    localDate: String = "",
    localTime: String? = nil
  ) {
    self.init()
    _setScalar(localDate, for: \.localDate)
    _setScalar(localTime, for: \.localTime)
  }
}
