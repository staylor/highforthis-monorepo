import { useTranslation } from 'react-i18next';

import PodcastForm from '#/components/Admin/Podcast/Form';
import { loadPodcast, updatePodcast } from '#/server/podcasts';
import type { Podcast } from '#/types/graphql';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadPodcast({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(
    await updatePodcast({ gql, id: params.id, formData: await request.formData(), url })
  );
}

export default function PodcastEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { podcast } = loaderData;
  if (!podcast) {
    return null;
  }

  return (
    <PodcastForm
      data={podcast as Podcast}
      heading={t('podcasts.edit')}
      buttonLabel={t('podcasts.update')}
    />
  );
}
