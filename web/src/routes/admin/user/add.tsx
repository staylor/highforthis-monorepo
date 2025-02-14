import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const label = t('users.add');
  return <UserForm heading={label} buttonLabel={label} />;
}

const userMutation = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`;
