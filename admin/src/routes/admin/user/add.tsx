import { useTranslation } from 'react-i18next';

import UserForm from '#/components/Admin/User/Form';
import { createUser } from '#/server/users';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/add';

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await createUser({ gql, formData: await request.formData(), url }));
}

export default function UserAdd() {
  const { t } = useTranslation();
  const label = t('users.add');
  return <UserForm heading={label} buttonLabel={label} />;
}
