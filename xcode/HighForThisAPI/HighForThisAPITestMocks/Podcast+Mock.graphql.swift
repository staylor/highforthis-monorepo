// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Podcast: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Podcast
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Podcast>>

  public struct MockFields: Sendable {
    @Field<AudioUpload>("audio") public var audio
    @Field<Double>("date") public var date
    @Field<String>("description") public var description
    @Field<String>("id") public var id
    @Field<String>("title") public var title
  }
}

public extension Mock where O == Podcast {
  convenience init(
    audio: Mock<AudioUpload>? = nil,
    date: Double? = nil,
    description: String = "",
    id: String = "",
    title: String = ""
  ) {
    self.init()
    _setEntity(audio, for: \.audio)
    _setScalar(date, for: \.date)
    _setScalar(description, for: \.description)
    _setScalar(id, for: \.id)
    _setScalar(title, for: \.title)
  }
}
