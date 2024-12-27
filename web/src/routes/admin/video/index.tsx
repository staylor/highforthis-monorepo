import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import ListTable, { RowTitle, RowActions } from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import { useUpdateQuery } from '~/components/Admin/ListTable/utils';
import { Heading } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import Select from '~/components/Form/Select';
import type { Columns } from '~/types';
import type { Video, VideosAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import query, { addPageOffset } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const variables = addPageOffset(request);
  ['search', 'year'].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      variables[key] = key === 'year' ? Number(value) : value;
    }
  });

  return query<VideosAdminQuery>({ request, context, query: videosQuery, variables });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleDelete({ request, context, mutation: videoMutation });
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
      {count && <Message param="deleted" text={t('videos.deleted', { count })} />}
      <Search placeholder={t('videos.search')} />
      <ListTable columns={columns} filters={filters} data={videos!} />
    </>
  );
}

const videosQuery = gql`
  query VideosAdmin($after: String, $first: Int, $search: String, $year: Int) {
    videos(after: $after, first: $first, search: $search, year: $year) @cache(key: "admin") {
      count
      edges {
        node {
          id
          publishedAt
          slug
          title
          year
        }
      }
      pageInfo {
        hasNextPage
      }
      years
    }
  }
`;

const videoMutation = gql`
  mutation DeleteVideo($ids: [ObjID]!) {
    removeVideo(ids: $ids)
  }
`;
