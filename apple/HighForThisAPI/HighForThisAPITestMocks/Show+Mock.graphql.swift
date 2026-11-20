// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Show: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Show
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Show>>

  public struct MockFields: Sendable {
    @Field<[Artist]>("artists") public var artists
    @Field<Double>("date") public var date
    @Field<String>("id") public var id
    @Field<String>("title") public var title
    @Field<Venue>("venue") public var venue
  }
}

public extension Mock where O == Show {
  convenience init(
    artists: [Mock<Artist>] = [],
    date: Double = 0.0,
    id: String = "",
    title: String? = nil,
    venue: Mock<Venue> = Mock<Venue>()
  ) {
    self.init()
    _setList(artists, for: \.artists)
    _setScalar(date, for: \.date)
    _setScalar(id, for: \.id)
    _setScalar(title, for: \.title)
    _setEntity(venue, for: \.venue)
  }
}
