const Post = `#graphql    
  enum PostStatus {
    DRAFT
    PUBLISH
  }

  type Post {
    id: ObjID!
    title: String!
    slug: String!
    editorState: EditorState
    summary: String
    status: PostStatus
    featuredMedia: [MediaUpload!]
    artists: [Artist]
    date: Float
  }

  type PostEdge {
    node: Post!
    cursor: String!
  }

  type PostConnection {
    count: Int!
    edges: [PostEdge!]!
    pageInfo: PageInfo!
  }

  input CreatePostInput {
    title: String!
    editorState: EditorStateInput
    summary: String
    status: PostStatus
    featuredMedia: [String]
    artists: [String]
    date: Float
  }

  input UpdatePostInput {
    title: String
    editorState: EditorStateInput
    summary: String
    status: PostStatus
    featuredMedia: [String]
    artists: [String]
    date: Float
  }

  extend type Query {
    posts(
      first: Int
      after: String
      last: Int
      before: String
      year: Int
      status: PostStatus
      search: String
    ): PostConnection
    post(id: ObjID, slug: String): Post
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post
    updatePost(id: ObjID!, input: UpdatePostInput!): Post
    removePost(ids: [ObjID]!): Boolean
  }
`;

export default Post;
