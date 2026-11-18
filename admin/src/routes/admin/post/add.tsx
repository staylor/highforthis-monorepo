import { useTranslation } from 'react-i18next';

import PostForm from '#/components/Admin/Post/Form';
import { createPost } from '#/server/posts';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/add';

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await createPost({ gql, formData: await request.formData(), url }));
}

export default function PostAdd() {
  const { t } = useTranslation();
  const label = t('posts.add');
  return <PostForm heading={label} buttonLabel={label} />;
}
