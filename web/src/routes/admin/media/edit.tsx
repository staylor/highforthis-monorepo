import { gql } from 'graphql-tag';

import MediaForm from '~/components/Admin/Media/Form';
import type { MediaAdminQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ params, request, context }: Route.LoaderArgs) {
  return query<MediaAdminQuery>({
    request,
    context,
    query: mediaQuery,
    variables: { id: params.id },
  });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: mediaMutation,
    variables: { id: params.id },
  });
}

export default function MediaEdit({ loaderData }: Route.ComponentProps) {
  return <MediaForm data={loaderData.media} heading="Edit Media" buttonLabel="Update Media" />;
}

const mediaQuery = gql`
  query MediaAdmin($id: ObjID!) {
    media(id: $id) {
      ...MediaForm_media
    }
  }
  ${MediaForm.fragments.media}
`;

const mediaMutation = gql`
  mutation UpdateMedia($id: ObjID!, $input: UpdateMediaUploadInput!) {
    updateMediaUpload(id: $id, input: $input) {
      ...MediaForm_media
    }
  }
  ${MediaForm.fragments.media}
`;
