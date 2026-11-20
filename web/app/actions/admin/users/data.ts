import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '#/lib/admin/list-variables.ts';
import type { UserEditQuery, UsersAdminQuery } from '#/types/graphql.ts';

const userFormFragment = gql`
  fragment UserForm_user on User {
    bio
    email
    id
    name
    roles
  }
`;

const usersQuery = gql`
  query UsersAdmin($after: String, $first: Int, $search: String) {
    users(after: $after, first: $first, search: $search) @cache(key: "admin") {
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

export function loadUsers({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return gql.query<UsersAdminQuery>(usersQuery, variables);
}

export function deleteUsers(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteUserMutation });
}

export function loadUser({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<UserEditQuery>(userQuery, { id });
}

export function createUser(args: FormArgs) {
  return submitForm({ ...args, mutation: createUserMutation, createMutation: 'createUser' });
}

export function updateUser({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updateUserMutation, variables: { id } });
}
