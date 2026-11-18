import { useTranslation } from 'react-i18next';

import VideoForm from '#/components/Admin/Video/Form';
import { loadVideo, updateVideo } from '#/server/videos';
import type { VideoThumbnail } from '#/types/graphql';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadVideo({ gql: graphqlClient({ request, context }), id: params.id });
}

export async function action({ request, context, params, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(
    await updateVideo({ gql, id: params.id, formData: await request.formData(), url })
  );
}

export default function VideoEdit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { video } = loaderData;
  if (!video) {
    return null;
  }

  const thumb = video?.thumbnails.find((t) => t.width === 480) as VideoThumbnail;

  return (
    <VideoForm data={video} heading={t('videos.edit')} buttonLabel={t('videos.update')}>
      <figure className="mb-6 max-w-full overflow-hidden">
        <img className="relative z-10" src={thumb.url} alt={video.title} />
      </figure>
    </VideoForm>
  );
}
