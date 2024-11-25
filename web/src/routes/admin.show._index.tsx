import { useFetcher, useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import ListTable, { RowTitle, RowActions, usePath } from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Checkbox from '~/components/Form/Checkbox';
import Message from '~/components/Form/Message';
import { formatShowLink } from '~/components/Shows/utils';
import type { Show, ShowConnection, ShowsAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import mutate, { parseFormData } from '~/utils/mutate';
import query, { addPageOffset, addSearchParam } from '~/utils/query';

export const loader: LoaderFunction = ({ request, context, params }) => {
  const variables = addSearchParam(request, addPageOffset(params, { order: 'DESC' }));
  return query({ request, context, query: showsQuery, variables });
};

export const action: ActionFunction = async ({ request, context }) => {
  if (request.method === 'POST') {
    const { id, attended } = await parseFormData(request);
    return mutate({
      context,
      mutation: updateMutation,
      variables: {
        id,
        input: {
          attended,
        },
      },
    });
  }
  return handleDelete({ request, context, mutation: deleteMutation });
};

export default function Shows() {
  const fetcher = useFetcher();
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
      label: 'Artists',
      render: (show: Show) => {
        const { artists } = show;
        const editUrl = `/admin/artist/${artists[0].id}`;
        let title = artists[0].name;
        if (artists.length > 1) {
          title += ` + ${artists.length - 1}`;
        }

        return (
          <>
            <RowTitle url={editUrl} title={title} />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'view', url: formatShowLink(show) },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Venue',
      render: ({ venue }: Show) => {
        const editUrl = `/admin/venue/${venue.id}`;
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
      label: 'Attended',
      className: 'text-center',
      render: ({ id, attended }: Show) => {
        return (
          <Checkbox
            checked={Boolean(attended)}
            onChange={(e) => {
              fetcher.submit(
                {
                  id,
                  attended: e.target.checked,
                },
                {
                  method: 'POST',
                }
              );
            }}
          />
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
      <HeaderAdd label="Add Show" />
      <Message param="deleted" text="Deleted %s shows." />
      <Search placeholder="Search shows" />
      <ListTable columns={columns} data={shows} />
    </>
  );
}

const showsQuery = gql`
  query ShowsAdmin(
    $after: String
    $artist: EntityArg
    $date: Float
    $first: Int
    $order: ShowOrder
    $search: String
    $venue: EntityArg
  ) {
    shows(
      after: $after
      artist: $artist
      date: $date
      first: $first
      order: $order
      search: $search
      venue: $venue
    ) @cache(key: "admin") {
      count
      edges {
        node {
          artists {
            id
            name
            slug
          }
          attended
          date
          id
          title
          venue {
            id
            name
            slug
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const updateMutation = gql`
  mutation UpdateShowAttended($id: ObjID!, $input: UpdateShowInput!) {
    updateShow(id: $id, input: $input) {
      id
    }
  }
`;

const deleteMutation = gql`
  mutation DeleteShow($ids: [ObjID]!) {
    removeShow(ids: $ids)
  }
`;
