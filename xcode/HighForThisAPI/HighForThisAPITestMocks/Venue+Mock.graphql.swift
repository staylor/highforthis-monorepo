// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Venue: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Venue
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Venue>>

  public struct MockFields: Sendable {
    @Field<String>("address") public var address
    @Field<String>("capacity") public var capacity
    @Field<VenueCoordinates>("coordinates") public var coordinates
    @Field<String>("id") public var id
    @Field<String>("name") public var name
    @Field<String>("slug") public var slug
    @Field<String>("website") public var website
  }
}

public extension Mock where O == Venue {
  convenience init(
    address: String? = nil,
    capacity: String? = nil,
    coordinates: Mock<VenueCoordinates>? = nil,
    id: String = "",
    name: String = "",
    slug: String = "",
    website: String? = nil
  ) {
    self.init()
    _setScalar(address, for: \.address)
    _setScalar(capacity, for: \.capacity)
    _setEntity(coordinates, for: \.coordinates)
    _setScalar(id, for: \.id)
    _setScalar(name, for: \.name)
    _setScalar(slug, for: \.slug)
    _setScalar(website, for: \.website)
  }
}
