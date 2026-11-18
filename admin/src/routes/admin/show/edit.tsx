import { useTranslation } from 'react-i18next';

import ShowForm from '#/components/Admin/Show/Form';
import { loadShow, updateShow } from '#/server/shows';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadShow({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await updateShow({ gql, id: params.id, formData: await request.formData(), url }));
}

export default function ShowEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return <ShowForm data={loaderData} heading={t('shows.edit')} buttonLabel={t('shows.update')} />;
}
