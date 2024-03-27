import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { User, UserConnection, UsersAdminQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context }) => {
  return query({ request, context, query: usersQuery });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: usersMutation });
};

export default function Users() {
  const path = usePath();
  const data = useLoaderData<UsersAdminQuery>();
  const users = data.users as UserConnection;

  const columns = [
    {
      label: 'Name',
      render: (user: User) => {
        const userUrl = `${path}/${user.id}`;
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
      <Heading>Users</Heading>
      <HeaderAdd label="User" />
      <Message param="deleted" text="Deleted %s users." />
      <ListTable columns={columns} data={users} />
    </>
  );
}

const usersQuery = gql`
  query UsersAdmin {
    users @cache(key: "admin") {
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
  mutation DeleteUser($ids: [ObjID]!) {
    removeUser(ids: $ids)
  }
`;
