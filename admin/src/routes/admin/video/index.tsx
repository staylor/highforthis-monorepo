import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import ListTable, { RowTitle, RowActions } from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import { useUpdateQuery } from '#/components/Admin/ListTable/utils';
import { Heading } from '#/components/Admin/styles';
import Message from '#/components/Form/Message';
import Select from '#/components/Form/Select';
import { deleteVideos, loadVideos } from '#/server/videos';
import type { Columns } from '#/types';
import type { Video } from '#/types/graphql';
import { deleteAction, graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/index';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadVideos({ gql: graphqlClient({ request, context }), searchParams: url.searchParams });
}

export async function action(args: Route.ActionArgs) {
  return deleteAction(args, deleteVideos);
}

export default function Videos({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { updateQuery, searchParams } = useUpdateQuery();
  const count = Number(searchParams.get('deleted') || 0);
  const { videos } = loaderData;

  const filters = (
    <Select
      className="mx-2"
      key="year"
      placeholder={t('videos.selectYear')}
      value={searchParams.get('year') || ''}
      choices={videos?.years as number[]}
      onChange={updateQuery('year')}
    />
  );

  const columns: Columns = [
    {
      label: t('videos.title'),
      render: (video: Video) => {
        const videoUrl = `${location.pathname}/${video.id}`;
        return (
          <>
            <RowTitle url={videoUrl} title={video.title} />
            <RowActions
              actions={[
                { type: 'edit', url: videoUrl },
                { type: 'view', url: `/video/${video.slug}` },
                { type: 'delete', url: videoUrl, ids: [video.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: t('videos.slug'),
      prop: 'slug',
    },
    {
      label: t('videos.year'),
      prop: 'year',
    },
    {
      label: t('videos.date'),
      render: (video: Video) => {
        const date = new Date(video.publishedAt);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return (
          <>
            {t('videos.published')}
            <br />
            {formattedDate}
          </>
        );
      },
    },
  ];

  return (
    <>
      <Heading>{t('videos.heading')}</Heading>
      {count > 0 && <Message param="deleted" text={t('videos.deleted', { count })} />}
      <Search placeholder={t('videos.search')} />
      <ListTable columns={columns} filters={filters} data={videos!} />
    </>
  );
}
