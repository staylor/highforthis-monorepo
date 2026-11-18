import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import ListTable, { RowTitle, RowActions } from '#/components/Admin/ListTable';
import Search from '#/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '#/components/Admin/styles';
import Message from '#/components/Form/Message';
import { deleteUsers, loadUsers } from '#/server/users';
import type { User } from '#/types/graphql';
import { deleteAction, graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/index';

export async function loader({ request, context, url }: Route.LoaderArgs) {
  return loadUsers({ gql: graphqlClient({ request, context }), searchParams: url.searchParams });
}

export async function action(args: Route.ActionArgs) {
  return deleteAction(args, deleteUsers);
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const { users } = loaderData;

  const columns = [
    {
      label: t('users.name'),
      render: (user: User) => {
        const userUrl = `${location.pathname}/${user.id}`;
        return (
          <>
            <RowTitle url={userUrl} title={user.name} />
            <RowActions
              actions={[
                { type: 'edit', url: userUrl },
                { type: 'delete', url: userUrl, ids: [user.id] },
              ]}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <Heading>{t('users.heading')}</Heading>
      <HeaderAdd label={t('users.add')} />
      {count > 0 && <Message param="deleted" text={t('users.deleted', { count })} />}
      <Search placeholder={t('users.search')} />
      <ListTable columns={columns} data={users!} />
    </>
  );
}
