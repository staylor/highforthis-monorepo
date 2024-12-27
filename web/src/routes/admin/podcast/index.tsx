import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

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
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const columns: Columns = [
    {
      label: t('podcasts.title'),
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
      <Heading>{t('podcasts.heading')}</Heading>
      <HeaderAdd label={t('podcasts.add')} />
      {count && <Message param="deleted" text={t('podcasts.deleted', { count })} />}
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
