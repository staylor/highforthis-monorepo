import { useTranslation } from 'react-i18next';

import VenueForm from '#/components/Admin/Venue/Form';
import { loadVenue, updateVenue } from '#/server/venues';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadVenue({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(
    await updateVenue({ gql, id: params.id, formData: await request.formData(), url })
  );
}

export default function VenueEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const label = t('venues.edit');
  return <VenueForm data={loaderData} heading={label} buttonLabel={label} />;
}
