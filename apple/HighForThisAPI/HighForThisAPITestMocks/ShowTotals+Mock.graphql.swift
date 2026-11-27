// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ShowTotals: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ShowTotals
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ShowTotals>>

  public struct MockFields: Sendable {
    @Field<Int>("artists") public var artists
    @Field<Double>("firstDate") public var firstDate
    @Field<Int>("shows") public var shows
    @Field<Int>("venues") public var venues
  }
}

public extension Mock where O == ShowTotals {
  convenience init(
    artists: Int = 0,
    firstDate: Double? = nil,
    shows: Int = 0,
    venues: Int = 0
  ) {
    self.init()
    _setScalar(artists, for: \.artists)
    _setScalar(firstDate, for: \.firstDate)
    _setScalar(shows, for: \.shows)
    _setScalar(venues, for: \.venues)
  }
}
