import { useTranslation } from 'react-i18next';

import ShowForm from '#/components/Admin/Show/Form';
import { createShow, loadNewShow } from '#/server/shows';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/add';

export async function loader({ request, context }: Route.LoaderArgs) {
  return loadNewShow({ gql: graphqlClient({ request, context }) });
}

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await createShow({ gql, formData: await request.formData(), url }));
}

export default function ShowAdd({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return <ShowForm data={loaderData} heading={t('shows.add')} buttonLabel={t('shows.add')} />;
}
