import { useTranslation } from 'react-i18next';

import PodcastForm from '#/components/Admin/Podcast/Form';
import { createPodcast } from '#/server/podcasts';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/add';

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await createPodcast({ gql, formData: await request.formData(), url }));
}

export default function PodcastAdd() {
  const { t } = useTranslation();
  const label = t('podcasts.add');
  return <PodcastForm heading={label} buttonLabel={label} />;
}
