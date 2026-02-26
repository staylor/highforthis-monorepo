const User = `#graphql      
  type User {
    id: String!
    name: String
    email: String!
    bio: String
    roles: [String]
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type UserConnection {
    count: Int!
    edges: [UserEdge!]!
    pageInfo: PageInfo!
  }

  input CreateUserInput {
    name: String
    email: String
    bio: String
    password: String
    roles: [String]
  }

  input UpdateUserInput {
    name: String
    email: String
    bio: String
    password: String
    roles: [String]
  }

  extend type Query {
    users(
      first: Int
      after: String
      last: Int
      before: String
      search: String
    ): UserConnection
    user(id: String!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: String!, input: UpdateUserInput!): User
    removeUser(ids: [String]!): Boolean
  }
`;

export default User;
