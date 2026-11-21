import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '#/lib/admin/list-variables.ts';
import type { PodcastEditQuery, PodcastsAdminQuery } from '#/types/graphql.ts';

const podcastFormFragment = gql`
  fragment PodcastForm_podcast on Podcast {
    id
    description
    title
    audio {
      ...FeaturedMedia_media
      id
    }
    image {
      ...FeaturedMedia_media
      id
    }
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

// Keeps a title like "2024" a string
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
