import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import Select from '@/components/Form/Select';
import query, { addPageOffset } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Video, VideoConnection, VideosAdminQuery } from '@/types/graphql';
import type { Columns } from '@/types';
import Search from '@/components/Admin/ListTable/Search';
import { useUpdateQuery } from '@/components/Admin/ListTable/utils';

export const loader: LoaderFunction = ({ request, context, params }) => {
  const url = new URL(request.url);
  const variables = addPageOffset(params);
  ['search', 'year'].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      variables[key] = key === 'year' ? parseInt(value, 10) : value;
    }
  });

  return query({ request, context, query: videosQuery, variables });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: videoMutation });
};

export default function Videos() {
  const path = usePath();
  const { updateQuery, searchParams } = useUpdateQuery();
  const data = useLoaderData<VideosAdminQuery>();
  const videos = data.videos as VideoConnection;

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
