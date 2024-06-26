const User = `#graphql      
  type User {
    id: ObjID!
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
    user(id: ObjID!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: ObjID!, input: UpdateUserInput!): User
    removeUser(ids: [ObjID]!): Boolean
  }
`;

export default User;
