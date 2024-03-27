import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query, { addPageOffset } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Podcast, PodcastConnection, PodcastsQuery } from '@/types/graphql';
import type { Columns } from '@/types';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: podcastsQuery,
    variables: addPageOffset(params),
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: podcastMutation });
};

export default function Podcasts() {
  const path = usePath();
  const data = useLoaderData<PodcastsQuery>();
  const podcasts = data.podcasts as PodcastConnection;
  const columns: Columns = [
    {
      label: 'Title',
      render: (podcast: Podcast) => {
        const editUrl = `${path}/${podcast.id}`;
        return (
          <>
            <RowTitle url={editUrl} title={podcast.title} />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'view', url: `/podcast/${podcast.id}` },
                { type: 'delete', url: editUrl, ids: [podcast.id] },
              ]}
            />
          </>
        );
      },
    },
  ];
  return (
    <>
      <Heading>Podcasts</Heading>
      <HeaderAdd label="Podcast" />
      <Message param="deleted" text="Deleted %s podcasts." />
      <ListTable columns={columns} data={podcasts} />
    </>
  );
}

const podcastsQuery = gql`
  query PodcastsAdmin {
    podcasts @cache(key: "admin") {
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

const podcastMutation = gql`
  mutation DeletePodcast($ids: [ObjID]!) {
    removePodcast(ids: $ids)
  }
`;
