import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import ListTable, { RowTitle, RowActions } from '~/components/Admin/ListTable';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Columns } from '~/types';
import type { Post, PostsAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import query, { addPageOffset } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<PostsAdminQuery>({
    request,
    context,
    query: postsQuery,
    variables: addPageOffset(request),
  });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleDelete({ request, context, mutation: postsMutation });
}

export default function Posts({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const columns: Columns = [
    {
      label: t('posts.title'),
      render: (post: Post) => {
        const editUrl = `${location.pathname}/${post.id}`;
        return (
          <>
            <RowTitle
              url={editUrl}
              title={`${post.title}${post.status === 'DRAFT' ? ' - Draft' : ''}`}
            />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'view', url: `/post/${post.slug}` },
                { type: 'delete', url: editUrl, ids: [post.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: t('posts.slug'),
      prop: 'slug',
    },
    {
      label: t('posts.date'),
      prop: 'date',
      type: 'date',
    },
  ];
  return (
    <>
      <Heading>{t('posts.heading')}</Heading>
      <HeaderAdd label={t('posts.add')} />
      {count && <Message param="deleted" text={t('posts.deleted', { count })} />}
      <ListTable columns={columns} data={loaderData.posts!} />
    </>
  );
}

const postsQuery = gql`
  query PostsAdmin($after: String, $first: Int, $search: String) {
    posts(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          date
          id
          slug
          status
          title
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const postsMutation = gql`
  mutation DeletePost($ids: [ObjID]!) {
    removePost(ids: $ids)
  }
`;
