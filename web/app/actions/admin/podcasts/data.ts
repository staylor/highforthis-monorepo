import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '@highforthis/shared/admin/forms';
import { addPageOffset, addSearchParam } from '@highforthis/shared/admin/listVariables';

import type { PodcastEditQuery, PodcastsAdminQuery } from '../../../types/graphql.ts';
import { featuredMediaFragment } from '../media/data.ts';

// The podcasts section's data, moved from the admin app's src/server/podcasts.ts with the same
// GraphQL operations. The list asks only for what it shows.

const podcastFormFragment = gql`
  fragment PodcastForm_podcast on Podcast {
    audio {
      ...FeaturedMedia_media
      id
    }
    description
    id
    image {
      ...FeaturedMedia_media
      id
    }
    title
  }
  ${featuredMediaFragment}
`;

const podcastsQuery = gql`
  query PodcastsAdmin($after: String, $first: Int, $search: String) {
    podcasts(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          id
          title
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const deletePodcastMutation = gql`
  mutation DeletePodcast($ids: [String]!) {
    removePodcast(ids: $ids)
  }
`;

const podcastQuery = gql`
  query PodcastEdit($id: String!) {
    podcast(id: $id) {
      ...PodcastForm_podcast
    }
  }
  ${podcastFormFragment}
`;

const createPodcastMutation = gql`
  mutation CreatePodcast($input: CreatePodcastInput!) {
    createPodcast(input: $input) {
      id
    }
  }
`;

const updatePodcastMutation = gql`
  mutation UpdatePodcast($id: String!, $input: UpdatePodcastInput!) {
    updatePodcast(id: $id, input: $input) {
      ...PodcastForm_podcast
    }
  }
  ${podcastFormFragment}
`;

// Keeps a title like "2024" a string, as with artists' and venues' names
const skipKeys = ['title'];

export function loadPodcasts({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return client.query<PodcastsAdminQuery>(podcastsQuery, variables);
}

export function deletePodcasts(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deletePodcastMutation });
}

export function loadPodcast({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<PodcastEditQuery>(podcastQuery, { id });
}

export function createPodcast(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createPodcastMutation,
    createMutation: 'createPodcast',
    skipKeys,
  });
}

export function updatePodcast({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updatePodcastMutation, variables: { id }, skipKeys });
}
