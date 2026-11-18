import { useTranslation } from 'react-i18next';

import PostForm from '#/components/Admin/Post/Form';
import { loadPost, updatePost } from '#/server/posts';
import type { Post } from '#/types/graphql';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadPost({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await updatePost({ gql, id: params.id, formData: await request.formData(), url }));
}

export default function PostEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { post } = loaderData;
  if (!post) {
    return null;
  }

  return <PostForm data={post as Post} heading={t('posts.edit')} buttonLabel={t('posts.update')} />;
}
