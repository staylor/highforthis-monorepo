import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import ListTable, { Thumbnail, RowTitle, RowActions } from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import { useUpdateQuery } from '#/components/Admin/ListTable/utils';
import { Heading, HeaderAdd } from '#/components/Admin/styles';
import Message from '#/components/Form/Message';
import Select from '#/components/Form/Select';
import Link from '#/components/Link';
import { deleteMedia, loadMediaList } from '#/server/media';
import type { Columns } from '#/types';
import type { MediaUpload } from '#/types/graphql';
import { deleteAction, graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/index';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadMediaList({
    gql: graphqlClient({ request, context }),
    searchParams: url.searchParams,
  });
}

export async function action(args: Route.ActionArgs) {
  return deleteAction(args, deleteMedia);
}

export default function Media({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { uploads } = loaderData;
  const location = useLocation();
  const { updateQuery, searchParams } = useUpdateQuery();
  const count = Number(searchParams.get('deleted') || 0);
  const added = Number(searchParams.get('added') || 0);
  const columns: Columns = [
    {
      className: 'w-16',
      render: (media: MediaUpload) => {
        if (media.type === 'audio') {
          return <Thumbnail media={media} />;
        }

        if (media.type === 'image') {
          return <Thumbnail media={media} />;
        }

        return null;
      },
    },
    {
      className: 'w-[60%]',
      label: t('media.title'),
      render: (media: MediaUpload) => {
        const editUrl = `${location.pathname}/${media.id}`;
        return (
          <>
            <RowTitle url={editUrl} title={media.title} subtitle={media.originalName} />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'delete', url: editUrl, ids: [media.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: t('media.type'),
      render: (media: MediaUpload) => {
        const search = new URLSearchParams();
        search.set('type', media.type);
        return (
          <Link to={{ pathname: location.pathname, search: search.toString() }}>{media.type}</Link>
        );
      },
    },
    {
      label: t('media.mimeType'),
      render: (media: MediaUpload) => {
        const search = new URLSearchParams();
        search.set('mimeType', media.mimeType);
        return (
          <Link to={{ pathname: location.pathname, search: search.toString() }}>
            {media.mimeType}
          </Link>
        );
      },
    },
  ];
  const filters = (
    <>
      <Select
        key="type"
        placeholder={t('media.selectMediaType')}
        value={searchParams.get('type') || ''}
        choices={uploads?.types?.map((type: string) => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.substring(1),
        }))}
        onChange={updateQuery('type')}
      />
      <Select
        key="mimeType"
        placeholder={t('media.selectMimeType')}
        value={searchParams.get('mimeType') || ''}
        choices={uploads?.mimeTypes || []}
        onChange={updateQuery('mimeType')}
      />
    </>
  );
  return (
    <>
      <Heading>{t('media.heading')}</Heading>
      <HeaderAdd label={t('media.add')} to={`${location.pathname}/upload`} />
      {count > 0 && <Message param="deleted" text={t('media.deleted', { count })} />}
      {added > 0 && <Message param="added" text={t('media.albumCovers.added', { count: added })} />}
      <Search placeholder={t('media.search')} />
      <ListTable columns={columns} filters={filters} data={uploads!} />
    </>
  );
}
