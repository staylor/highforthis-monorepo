import { useTranslation } from 'react-i18next';
import { useFetcher, useLocation, useSearchParams } from 'react-router';

import ListTable, { RowTitle, RowActions } from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '#/components/Admin/styles';
import Checkbox from '#/components/Form/Checkbox';
import Message from '#/components/Form/Message';
import { formatShowLink } from '#/components/Shows/utils';
import { deleteShows, loadShows, setShowAttended } from '#/server/shows';
import type { Show } from '#/types/graphql';
import { deleteAction, graphqlClient, isListTableIntent } from '#/utils/route.server';

import type { Route } from './+types';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadShows({ gql: graphqlClient({ request, context }), searchParams: url.searchParams });
}

export async function action(args: Route.ActionArgs) {
  const { request } = args;
  if (!(await isListTableIntent(request))) {
    return setShowAttended({ gql: graphqlClient(args), formData: await request.formData() });
  }
  return deleteAction(args, deleteShows);
}

export default function Shows({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const deletedCount = Number(searchParams.get('deleted') || 0);
  const importedCount = Number(searchParams.get('imported') || 0);
  const artistsCreated = Number(searchParams.get('artistsCreated') || 0);
  const venuesCreated = Number(searchParams.get('venuesCreated') || 0);
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
      <HeaderAdd label={t('shows.bulk.nav')} to="/admin/show/bulk" />
      {deletedCount > 0 && (
        <Message param="deleted" text={t('shows.deleted', { count: deletedCount })} />
      )}
      {importedCount > 0 && (
        <Message
          param="imported"
          text={t('shows.bulk.success', {
            artistsCreated,
            count: importedCount,
            venuesCreated,
          })}
        />
      )}
      <Search placeholder={t('shows.search')} />
      <ListTable columns={columns} data={shows!} />
    </>
  );
}
