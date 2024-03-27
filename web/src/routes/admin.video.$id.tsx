import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import VideoForm from '@/components/Admin/Video/Form';
import query from '@/utils/query';
import { handleSubmission } from '@/utils/action';
import type { Video, VideoEditQuery, VideoThumbnail } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: videoQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: videoMutation,
    variables: { id: params.id },
  });
};

export default function VideoEdit() {
  const data = useLoaderData<VideoEditQuery>();
  const video = data.video as Video;
  const thumb = video?.thumbnails.find((t) => t.width === 480) as VideoThumbnail;

  return (
    <VideoForm data={video} heading="Edit Video" buttonLabel="Update Video">
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
