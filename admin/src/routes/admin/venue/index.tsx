import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { name, slug, excludeFromSearch, website } from '#/components/Admin/Entity/ListTable';
import ListTable, { Thumbnail } from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import PermanentlyClosed from '#/components/Admin/Venue/PermanentlyClosed';
import { Heading, HeaderAdd } from '#/components/Admin/styles';
import Message from '#/components/Form/Message';
import { deleteVenues, loadVenues, setVenueFlag } from '#/server/venues';
import type { Columns } from '#/types';
import { deleteAction, graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/index';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadVenues({ gql: graphqlClient({ request, context }), searchParams: url.searchParams });
}

export async function action(args: Route.ActionArgs) {
  const { request } = args;
  if (request.method === 'POST') {
    return setVenueFlag({ gql: graphqlClient(args), formData: await request.formData() });
  }
  return deleteAction(args, deleteVenues);
}

export default function Venues({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const { venues } = loaderData;

  const columns: Columns = [
    {
      className: 'w-16',
      render: (data: any) => {
        if (data.featuredMedia?.[0] && data.featuredMedia[0].type === 'image') {
          return <Thumbnail media={data.featuredMedia[0]} />;
        }

        return null;
      },
    },
    name(i18n),
    slug(i18n),
    website(i18n),
    {
      label: t('venues.capacity'),
      prop: 'capacity',
    },
    {
      label: t('venues.address'),
      prop: 'address',
    },
    excludeFromSearch(i18n),
    {
      label: t('venues.permanentlyClosed'),
      className: 'text-center',
      render: (data: any) => <PermanentlyClosed data={data} />,
    },
  ];

  return (
    <>
      <Heading>{t('venues.heading')}</Heading>
      <HeaderAdd label={t('venues.add')} />
      {count > 0 && <Message param="deleted" text={t('venues.deleted', { count })} />}
      <Search placeholder={t('venues.search')} />
      <ListTable columns={columns} data={venues!} />
    </>
  );
}
