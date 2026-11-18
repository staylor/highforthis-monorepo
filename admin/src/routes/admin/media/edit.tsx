import { useTranslation } from 'react-i18next';

import MediaForm from '#/components/Admin/Media/Form';
import { loadMedia, updateMedia } from '#/server/media';
import type { MediaUpload } from '#/types/graphql';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ params, request, context }: Route.LoaderArgs) {
  return loadMedia({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(
    await updateMedia({ gql, id: params.id, formData: await request.formData(), url })
  );
}

export default function MediaEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { media } = loaderData;
  if (!media) {
    return null;
  }

  return (
    <MediaForm
      data={loaderData.media as MediaUpload}
      heading={t('media.edit')}
      buttonLabel={t('media.update')}
    />
  );
}
