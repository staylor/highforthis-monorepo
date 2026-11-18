import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import ListTable, { RowTitle, RowActions } from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '#/components/Admin/styles';
import Message from '#/components/Form/Message';
import { deletePodcasts, loadPodcasts } from '#/server/podcasts';
import type { Columns } from '#/types';
import type { Podcast } from '#/types/graphql';
import { deleteAction, graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/index';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadPodcasts({ gql: graphqlClient({ request, context }), searchParams: url.searchParams });
}

export async function action(args: Route.ActionArgs) {
  return deleteAction(args, deletePodcasts);
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
      {count > 0 && <Message param="deleted" text={t('podcasts.deleted', { count })} />}
      <Search placeholder={t('podcasts.search')} />
      <ListTable columns={columns} data={loaderData.podcasts!} />
    </>
  );
}
