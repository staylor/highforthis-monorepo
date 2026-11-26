import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { listVariables, type ListArgs } from '#/lib/admin/list-variables.ts';
import type { UserEditQuery, UsersAdminQuery } from '#/types/graphql.ts';

const userFormFragment = gql`
  fragment UserForm_user on User {
    id
    bio
    email
    name
    roles
  }
`;

const usersQuery = gql`
  query UsersAdmin($after: String, $first: Int, $search: String) {
    users(after: $after, first: $first, search: $search) {
      count
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const deleteUserMutation = gql`
  mutation DeleteUser($ids: [String]!) {
    removeUser(ids: $ids)
  }
`;

const userQuery = gql`
  query UserEdit($id: String!) {
    user(id: $id) {
      ...UserForm_user
    }
  }
  ${userFormFragment}
`;

const createUserMutation = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`;

const updateUserMutation = gql`
  mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserForm_user
    }
  }
  ${userFormFragment}
`;

// A password left empty is sent as null, which keeps the one the user has
const textFields = ['name', 'email', 'password', 'bio'];

export function loadUsers({ gql, searchParams }: ListArgs) {
  return gql.query<UsersAdminQuery>(usersQuery, listVariables(searchParams));
}

export function deleteUsers(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteUserMutation });
}

export function loadUser({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<UserEditQuery>(userQuery, { id });
}

export function createUser(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createUserMutation,
    createMutation: 'createUser',
    textFields,
  });
}

export function updateUser({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updateUserMutation, variables: { id }, textFields });
}
