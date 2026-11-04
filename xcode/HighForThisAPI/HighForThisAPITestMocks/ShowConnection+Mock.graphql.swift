// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class ShowConnection: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.ShowConnection
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<ShowConnection>>

  public struct MockFields: Sendable {
    @Field<[ShowEdge]>("edges") public var edges
    @Field<[Int]>("years") public var years
  }
}

public extension Mock where O == ShowConnection {
  convenience init(
    edges: [Mock<ShowEdge>] = [],
    years: [Int]? = nil
  ) {
    self.init()
    _setList(edges, for: \.edges)
    _setScalarList(years, for: \.years)
  }
}
