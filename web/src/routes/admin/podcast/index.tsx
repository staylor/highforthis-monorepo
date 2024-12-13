import { gql } from 'graphql-tag';
import { useLocation } from 'react-router';

import ListTable, { RowTitle, RowActions } from '~/components/Admin/ListTable';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Columns } from '~/types';
import type { Podcast, PodcastsQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import query, { addPageOffset } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<PodcastsQuery>({
    request,
    context,
    query: podcastsQuery,
    variables: addPageOffset(request),
  });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleDelete({ request, context, mutation: podcastMutation });
}

export default function Podcasts({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const columns: Columns = [
    {
      label: 'Title',
      render: (podcast: Podcast) => {
        const editUrl = `${location.pathname}/${podcast.id}`;
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
      <HeaderAdd label="Add Podcast" />
      <Message param="deleted" text="Deleted %s podcasts." />
      <ListTable columns={columns} data={loaderData.podcasts!} />
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
