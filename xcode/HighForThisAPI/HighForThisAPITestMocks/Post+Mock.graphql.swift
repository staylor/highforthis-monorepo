// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Post: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Post
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Post>>

  public struct MockFields: Sendable {
    @Field<EditorState>("editorState") public var editorState
    @Field<[MediaUpload]>("featuredMedia") public var featuredMedia
    @Field<String>("id") public var id
    @Field<String>("slug") public var slug
    @Field<String>("summary") public var summary
    @Field<String>("title") public var title
  }
}

public extension Mock where O == Post {
  convenience init(
    editorState: Mock<EditorState>? = nil,
    featuredMedia: [(any AnyMock)]? = nil,
    id: String = "",
    slug: String = "",
    summary: String? = nil,
    title: String = ""
  ) {
    self.init()
    _setEntity(editorState, for: \.editorState)
    _setList(featuredMedia, for: \.featuredMedia)
    _setScalar(id, for: \.id)
    _setScalar(slug, for: \.slug)
    _setScalar(summary, for: \.summary)
    _setScalar(title, for: \.title)
  }
}
