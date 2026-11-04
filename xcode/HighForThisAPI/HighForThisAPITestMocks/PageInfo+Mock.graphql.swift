// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class PageInfo: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.PageInfo
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<PageInfo>>

  public struct MockFields: Sendable {
    @Field<Bool>("hasNextPage") public var hasNextPage
    @Field<Bool>("hasPreviousPage") public var hasPreviousPage
  }
}

public extension Mock where O == PageInfo {
  convenience init(
    hasNextPage: Bool? = nil,
    hasPreviousPage: Bool? = nil
  ) {
    self.init()
    _setScalar(hasNextPage, for: \.hasNextPage)
    _setScalar(hasPreviousPage, for: \.hasPreviousPage)
  }
}
