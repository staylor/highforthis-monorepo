import { gql } from 'graphql-tag';

import { podcastFormFragment } from '#/components/Admin/Podcast/Form.graphql';
import type { PodcastEditQuery, PodcastsAdminQuery } from '#/types/graphql';
import { addPageOffset, addSearchParam } from '#/utils/listVariables';

import { deleteSelected, submitForm, type FormArgs } from './forms';
import type { GraphQLClient } from './graphql';

const podcastsQuery = gql`
  query PodcastsAdmin($after: String, $first: Int, $search: String) {
    podcasts(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          audio {
            destination
            id
            images {
              fileName
              width
            }
            type
          }
          id
          image {
            crops {
              fileName
              width
            }
            destination
            id
            type
          }
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

export function loadPodcasts({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return gql.query<PodcastsAdminQuery>(podcastsQuery, variables);
}

export function deletePodcasts(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deletePodcastMutation });
}

export function loadPodcast({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<PodcastEditQuery>(podcastQuery, { id });
}

export function createPodcast(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createPodcastMutation,
    createMutation: 'createShow',
  });
}

export function updatePodcast({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updatePodcastMutation, variables: { id } });
}
