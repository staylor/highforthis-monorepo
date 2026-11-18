import { useTranslation } from 'react-i18next';

import ArtistForm from '#/components/Admin/Artist/Form';
import { createArtist } from '#/server/artists';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/add';

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await createArtist({ gql, formData: await request.formData(), url }));
}

export default function ArtistAdd() {
  const { t } = useTranslation();
  const label = t('artists.add');
  return <ArtistForm heading={label} buttonLabel={label} />;
}
