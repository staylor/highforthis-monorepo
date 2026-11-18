import type { Podcast, PodcastQuery } from '@highforthis/shared/web/types/graphql';
import query from '@highforthis/shared/web/utils/query';
import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import PodcastForm from '#/components/Admin/Podcast/Form';
import { handleSubmission } from '#/utils/action';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<PodcastQuery>({
    request,
    context,
    query: podcastQuery,
    variables: { id: params.id },
  });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  return handleSubmission({
    request,
    url,
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
  query PodcastEdit($id: String!) {
    podcast(id: $id) {
      ...PodcastForm_podcast
    }
  }
  ${PodcastForm.fragments.podcast}
`;

const podcastMutation = gql`
  mutation UpdatePodcast($id: String!, $input: UpdatePodcastInput!) {
    updatePodcast(id: $id, input: $input) {
      ...PodcastForm_podcast
    }
  }
  ${PodcastForm.fragments.podcast}
`;
