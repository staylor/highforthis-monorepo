import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { name, slug, excludeFromSearch, website } from '#/components/Admin/Entity/ListTable';
import ListTable from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '#/components/Admin/styles';
import Artwork from '#/components/Artist/Artwork';
import Message from '#/components/Form/Message';
import { deleteArtists, loadArtists, setArtistExcludeFromSearch } from '#/server/artists';
import type { Columns } from '#/types';
import { deleteAction, graphqlClient, isDeleteIntent } from '#/utils/route.server';

import type { Route } from './+types/index';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadArtists({ gql: graphqlClient({ request, context }), searchParams: url.searchParams });
}

export async function action(args: Route.ActionArgs) {
  const { request } = args;
  if (!(await isDeleteIntent(request))) {
    return setArtistExcludeFromSearch({
      gql: graphqlClient(args),
      formData: await request.formData(),
    });
  }
  return deleteAction(args, deleteArtists);
}

export default function Artists({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const columns: Columns = [
    {
      className: 'w-16',
      render: (data: any) => {
        if (data.appleMusic?.artwork) {
          return <Artwork name={data.name} data={data.appleMusic} imageSize={44} />;
        }

        return null;
      },
    },
    name(i18n),
    slug(i18n),
    excludeFromSearch(i18n),
    website(i18n),
  ];

  return (
    <>
      <Heading>{t('artists.heading')}</Heading>
      <HeaderAdd label={t('artists.add')} />
      {count > 0 && <Message param="deleted" text={t('artists.deleted', { count })} />}
      <Search placeholder={t('artists.search')} />
      <ListTable columns={columns} data={loaderData.artists!} />
    </>
  );
}
