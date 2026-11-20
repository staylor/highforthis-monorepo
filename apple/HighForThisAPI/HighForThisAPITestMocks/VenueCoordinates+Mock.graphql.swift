// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class VenueCoordinates: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.VenueCoordinates
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<VenueCoordinates>>

  public struct MockFields: Sendable {
    @Field<Double>("latitude") public var latitude
    @Field<Double>("longitude") public var longitude
  }
}

public extension Mock where O == VenueCoordinates {
  convenience init(
    latitude: Double? = nil,
    longitude: Double? = nil
  ) {
    self.init()
    _setScalar(latitude, for: \.latitude)
    _setScalar(longitude, for: \.longitude)
  }
}
