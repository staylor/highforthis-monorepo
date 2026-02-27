import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import ListTable, { RowTitle, RowActions } from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { User, UsersAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import query, { addPageOffset } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const variables = addPageOffset(request);
  const search = url.searchParams.get('search');
  if (search) {
    variables.search = search;
  }
  return query<UsersAdminQuery>({ request, context, query: usersQuery, variables });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleDelete({ request, context, mutation: usersMutation });
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

const usersQuery = gql`
  query UsersAdmin($after: String, $first: Int, $search: String) {
    users(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const usersMutation = gql`
  mutation DeleteUser($ids: [String]!) {
    removeUser(ids: $ids)
  }
`;
