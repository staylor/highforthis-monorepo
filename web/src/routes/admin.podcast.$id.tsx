import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import PodcastForm from '@/components/Admin/Podcast/Form';
import query from '@/utils/query';
import { handleSubmission } from '@/utils/action';
import type { Podcast, PodcastQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: podcastQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: podcastMutation,
    variables: { id: params.id },
  });
};

export default function PodcastEdit() {
  const data = useLoaderData<PodcastQuery>();
  const podcast = data.podcast as Podcast;
  return <PodcastForm data={podcast} heading="Edit Podcast" buttonLabel="Update Podcast" />;
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
