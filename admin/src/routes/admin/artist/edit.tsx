import { useTranslation } from 'react-i18next';

import ArtistForm from '#/components/Admin/Artist/Form';
import { loadArtist, updateArtist } from '#/server/artists';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadArtist({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(
    await updateArtist({ gql, id: params.id, formData: await request.formData(), url })
  );
}

export default function ArtistEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const label = t('artists.edit');
  return <ArtistForm data={loaderData} heading={label} buttonLabel={label} />;
}
