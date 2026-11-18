import { useTranslation } from 'react-i18next';

import VenueForm from '#/components/Admin/Venue/Form';
import { createVenue } from '#/server/venues';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/add';

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await createVenue({ gql, formData: await request.formData(), url }));
}

export default function VenueAdd() {
  const { t } = useTranslation();
  const label = t('venues.add');
  return <VenueForm heading={label} buttonLabel={label} />;
}
