import type { Post, PostQuery } from '@highforthis/shared/web/types/graphql';
import query from '@highforthis/shared/web/utils/query';
import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import PostForm from '#/components/Admin/Post/Form';
import { handleSubmission } from '#/utils/action';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<PostQuery>({ request, context, query: postQuery, variables: { id: params.id } });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  return handleSubmission({
    request,
    url,
    context,
    mutation: postMutation,
    variables: { id: params.id },
  });
}

export default function PostEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { post } = loaderData;
  if (!post) {
    return null;
  }

  return <PostForm data={post as Post} heading={t('posts.edit')} buttonLabel={t('posts.update')} />;
}

const postQuery = gql`
  query PostEdit($id: String!) {
    post(id: $id) {
      ...PostForm_post
    }
  }
  ${PostForm.fragments.post}
`;

const postMutation = gql`
  mutation UpdatePost($id: String!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      ...PostForm_post
    }
  }
  ${PostForm.fragments.post}
`;
