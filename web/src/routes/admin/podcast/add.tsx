import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import PodcastForm from '~/components/Admin/Podcast/Form';
import { handleSubmission } from '~/utils/action';

import type { Route } from './+types/add';

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: podcastMutation,
    createMutation: 'createShow',
  });
}

export default function PodcastAdd() {
  const { t } = useTranslation();
  const label = t('podcasts.add');
  return <PodcastForm heading={label} buttonLabel={label} />;
}

const podcastMutation = gql`
  mutation CreatePodcast($input: CreatePodcastInput!) {
    createPodcast(input: $input) {
      id
    }
  }
`;
