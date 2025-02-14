import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import UserForm from '~/components/Admin/User/Form';
import type { UserEditQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<UserEditQuery>({ request, context, query: userQuery, variables: { id: params.id } });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: userMutation,
    variables: { id: params.id },
  });
}

export default function UserEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { user } = loaderData;
  if (!user) {
    return null;
  }

  return <UserForm data={user} heading={t('users.edit')} buttonLabel={t('users.update')} />;
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
