import { gql } from 'graphql-tag';

import ListTable, { RowTitle, RowActions, usePath } from '~/components/Admin/ListTable';
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

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const variables = addPageOffset(params);
  ['search', 'year'].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      variables[key] = key === 'year' ? parseInt(value, 10) : value;
    }
  });

  return query<VideosAdminQuery>({ request, context, query: videosQuery, variables });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleDelete({ request, context, mutation: videoMutation });
}

export default function Videos({ loaderData }: Route.ComponentProps) {
  const path = usePath();
  const { updateQuery, searchParams } = useUpdateQuery();
  const { videos } = loaderData;

  const filters = (
    <Select
      className="mx-2"
      key="year"
      placeholder="Select Year"
      value={searchParams.get('year') || ''}
      choices={videos?.years as number[]}
      onChange={updateQuery('year')}
    />
  );

  const columns: Columns = [
    {
      label: 'Title',
      render: (video: Video) => {
        const videoUrl = `${path}/${video.id}`;
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
      label: 'Slug',
      prop: 'slug',
    },
    {
      label: 'Year',
      prop: 'year',
    },
    {
      label: 'Date',
      render: (video: Video) => {
        const date = new Date(video.publishedAt);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return (
          <>
            Published
            <br />
            {formattedDate}
          </>
        );
      },
    },
  ];

  return (
    <>
      <Heading>Videos</Heading>
      <Message param="deleted" text="Deleted %s videos." />
      <Search placeholder="Search videos" />
      <ListTable columns={columns} filters={filters} data={videos} />
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
