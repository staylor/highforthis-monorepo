import { gql } from 'graphql-tag';

import UserForm from '~/components/Admin/User/Form';
import { handleSubmission } from '~/utils/action';

import type { Route } from './+types/add';

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: userMutation,
    createMutation: 'createUser',
  });
}

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
