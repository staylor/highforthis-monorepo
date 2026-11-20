// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Artist: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Artist
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Artist>>

  public struct MockFields: Sendable {
    @Field<AppleMusicData>("appleMusic") public var appleMusic
    @Field<String>("id") public var id
    @Field<String>("name") public var name
    @Field<String>("slug") public var slug
    @Field<String>("website") public var website
  }
}

public extension Mock where O == Artist {
  convenience init(
    appleMusic: Mock<AppleMusicData>? = nil,
    id: String = "",
    name: String = "",
    slug: String = "",
    website: String? = nil
  ) {
    self.init()
    _setEntity(appleMusic, for: \.appleMusic)
    _setScalar(id, for: \.id)
    _setScalar(name, for: \.name)
    _setScalar(slug, for: \.slug)
    _setScalar(website, for: \.website)
  }
}
