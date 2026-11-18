import { useTranslation } from 'react-i18next';

import UserForm from '#/components/Admin/User/Form';
import { loadUser, updateUser } from '#/server/users';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadUser({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await updateUser({ gql, id: params.id, formData: await request.formData(), url }));
}

export default function UserEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { user } = loaderData;
  if (!user) {
    return null;
  }

  return <UserForm data={user} heading={t('users.edit')} buttonLabel={t('users.update')} />;
}
