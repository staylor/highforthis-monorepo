import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import UserForm from '@/components/Admin/User/Form';
import type { User, UserEditQuery } from '@/types/graphql';
import { handleSubmission } from '@/utils/action';
import query from '@/utils/query';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: userQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: userMutation,
    variables: { id: params.id },
  });
};

export default function UserEdit() {
  const data = useLoaderData<UserEditQuery>();
  const user = data.user as User;
  return <UserForm data={user} heading="Edit User" buttonLabel="Update User" />;
}

const userQuery = gql`
  query UserEdit($id: ObjID!) {
    user(id: $id) {
      ...UserForm_user
    }
  }
  ${UserForm.fragments.user}
`;

const userMutation = gql`
  mutation UpdateUser($id: ObjID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserForm_user
    }
  }
  ${UserForm.fragments.user}
`;
