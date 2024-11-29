import { gql } from 'graphql-tag';

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
  return <PodcastForm heading="Add Podcast" buttonLabel="Add Podcast" />;
}

const podcastMutation = gql`
  mutation CreatePodcast($input: CreatePodcastInput!) {
    createPodcast(input: $input) {
      id
    }
  }
`;
