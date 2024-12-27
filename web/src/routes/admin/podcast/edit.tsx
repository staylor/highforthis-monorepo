import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import PodcastForm from '~/components/Admin/Podcast/Form';
import type { Podcast, PodcastQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<PodcastQuery>({
    request,
    context,
    query: podcastQuery,
    variables: { id: params.id },
  });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: podcastMutation,
    variables: { id: params.id },
  });
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

const podcastQuery = gql`
  query PodcastEdit($id: ObjID!) {
    podcast(id: $id) {
      ...PodcastForm_podcast
    }
  }
  ${PodcastForm.fragments.podcast}
`;

const podcastMutation = gql`
  mutation UpdatePodcast($id: ObjID!, $input: UpdatePodcastInput!) {
    updatePodcast(id: $id, input: $input) {
      ...PodcastForm_podcast
    }
  }
  ${PodcastForm.fragments.podcast}
`;
