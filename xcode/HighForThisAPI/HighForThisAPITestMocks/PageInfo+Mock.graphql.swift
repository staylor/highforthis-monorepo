// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class PageInfo: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.PageInfo
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<PageInfo>>

  public struct MockFields: Sendable {
    @Field<String>("endCursor") public var endCursor
    @Field<Bool>("hasNextPage") public var hasNextPage
  }
}

public extension Mock where O == PageInfo {
  convenience init(
    endCursor: String? = nil,
    hasNextPage: Bool? = nil
  ) {
    self.init()
    _setScalar(endCursor, for: \.endCursor)
    _setScalar(hasNextPage, for: \.hasNextPage)
  }
}
