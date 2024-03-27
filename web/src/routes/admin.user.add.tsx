import { gql } from 'graphql-tag';
import type { ActionFunction } from '@remix-run/server-runtime';

import UserForm from '@/components/Admin/User/Form';
import { handleSubmission } from '@/utils/action';

export const action: ActionFunction = ({ request, context }) => {
  return handleSubmission({
    request,
    context,
    mutation: userMutation,
    createMutation: 'createUser',
  });
};

export default function UserAdd() {
  return <UserForm heading="Add User" buttonLabel="Add User" />;
}

const userMutation = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`;
