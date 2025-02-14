import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import PostForm from '~/components/Admin/Post/Form';
import { handleSubmission } from '~/utils/action';

import type { Route } from './+types/add';

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: postMutation,
    createMutation: 'createPost',
  });
}

export default function PostAdd() {
  const { t } = useTranslation();
  const label = t('posts.add');
  return <PostForm heading={label} buttonLabel={label} />;
}

const postMutation = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostForm_post
    }
  }
  ${PostForm.fragments.post}
`;
