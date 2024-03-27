import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query, { addPageOffset } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Show, ShowConnection, ShowsAdminQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: showsQuery,
    variables: addPageOffset(params, { order: 'DESC' }),
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: showsMutation });
};

export default function Shows() {
  const path = usePath();
  const data = useLoaderData<ShowsAdminQuery>();
  const shows = data.shows as ShowConnection;

  const columns = [
    {
      label: 'Title',
      render: (show: Show) => {
        const showUrl = `${path}/${show.id}`;
        return (
          <>
            <RowTitle url={showUrl} title={show.title} />
            <RowActions
              actions={[
                { type: 'edit', url: showUrl },
                { type: 'delete', url: showUrl, ids: [show.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Artist',
      render: ({ artist }: Show) => {
        const editUrl = `/admin/term/${artist.taxonomy.id}/${artist.id}`;
        return (
          <>
            <RowTitle url={editUrl} title={artist.name} />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'view', url: `/artist/${artist.slug}` },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Venue',
      render: ({ venue }: Show) => {
        const editUrl = `/admin/term/${venue.taxonomy.id}/${venue.id}`;
        return (
          <>
            <RowTitle url={editUrl} title={venue.name} />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'view', url: `/venue/${venue.slug}` },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Date',
      prop: 'date',
      type: 'date',
    },
  ];

  return (
    <>
      <Heading>Shows</Heading>
      <HeaderAdd label="Show" />
      <Message param="deleted" text="Deleted %s shows." />
      <ListTable columns={columns} data={shows} />
    </>
  );
}

const showsQuery = gql`
  query ShowsAdmin(
    $after: String
    $date: Float
    $first: Int
    $order: ShowOrder
    $search: String
    $taxonomy: String
    $term: String
  ) {
    shows(
      after: $after
      date: $date
      first: $first
      order: $order
      search: $search
      taxonomy: $taxonomy
      term: $term
    ) @cache(key: "admin") {
      count
      edges {
        node {
          artist {
            id
            name
            slug
            taxonomy {
              id
            }
          }
          date
          id
          title
          venue {
            id
            name
            slug
            taxonomy {
              id
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const showsMutation = gql`
  mutation DeleteShow($ids: [ObjID]!) {
    removeShow(ids: $ids)
  }
`;
