import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useFetcher, useLocation, useSearchParams } from 'react-router';

import ListTable, { RowTitle, RowActions } from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Checkbox from '~/components/Form/Checkbox';
import Message from '~/components/Form/Message';
import { formatShowLink } from '~/components/Shows/utils';
import type { Show, ShowsAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import mutate, { parseFormData } from '~/utils/mutate';
import query, { addPageOffset, addSearchParam } from '~/utils/query';

import type { Route } from './+types';

export async function loader({ request, context }: Route.LoaderArgs) {
  const variables = addSearchParam(request, addPageOffset(request, { order: 'DESC' }));
  return query<ShowsAdminQuery>({ request, context, query: showsQuery, variables });
}

export async function action({ request, context }: Route.ActionArgs) {
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
}

export default function Shows({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const { shows } = loaderData;

  const columns = [
    {
      label: t('shows.title'),
      render: (show: Show) => {
        const showUrl = `${location.pathname}/${show.id}`;
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
      label: t('shows.artists'),
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
      label: t('shows.venue'),
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
      label: t('shows.attended.label'),
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
      label: t('shows.date'),
      prop: 'date',
      type: 'date',
    },
  ];

  return (
    <>
      <Heading>{t('shows.heading')}</Heading>
      <HeaderAdd label={t('shows.add')} />
      {count > 0 && <Message param="deleted" text={t('shows.deleted', { count })} />}
      <Search placeholder={t('shows.search')} />
      <ListTable columns={columns} data={shows!} />
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
