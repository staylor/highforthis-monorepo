import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import VideoForm from '~/components/Admin/Video/Form';
import type { VideoEditQuery, VideoThumbnail } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<VideoEditQuery>({
    request,
    context,
    query: videoQuery,
    variables: { id: params.id },
  });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: videoMutation,
    variables: { id: params.id },
  });
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

const videoQuery = gql`
  query VideoEdit($id: ObjID) {
    video(id: $id) {
      ...VideoForm_video
    }
  }
  ${VideoForm.fragments.video}
`;

const videoMutation = gql`
  mutation UpdateVideo($id: ObjID!, $input: UpdateVideoInput!) {
    updateVideo(id: $id, input: $input) {
      ...VideoForm_video
    }
  }
  ${VideoForm.fragments.video}
`;
