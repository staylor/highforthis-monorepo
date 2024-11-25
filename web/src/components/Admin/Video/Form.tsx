import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';

import Form from '@/components/Admin/Form';
import { Heading } from '@/components/Admin/styles';
import Message from '@/components/Form/Message';
import type { Fields } from '@/types';
import type { Video } from '@/types/graphql';

type VideoFormProps = PropsWithChildren<{
  data?: Video;
  heading: string;
  buttonLabel: string;
}>;

const videoFields: Fields = [
  { label: 'Title', prop: 'title' },
  { label: 'Slug', prop: 'slug' },
  { label: 'Type', prop: 'dataType' },
  {
    label: 'Playlist',
    prop: 'dataPlaylistId',
    type: 'custom',
    render: (video: Video) => (
      <a
        className="underline"
        href={`https://www.youtube.com/playlist?list=${video.dataPlaylistId}`}
      >
        View {video.year} Playlist
      </a>
    ),
  },
];

function VideoForm({ data = {} as Video, heading, buttonLabel, children = null }: VideoFormProps) {
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text="Video updated." />
      {children}
      <Form data={data} fields={videoFields} buttonLabel={buttonLabel} />
    </>
  );
}

VideoForm.fragments = {
  video: gql`
    fragment VideoForm_video on Video {
      dataPlaylistId
      dataType
      id
      slug
      thumbnails {
        height
        url
        width
      }
      title
      year
    }
  `,
};

export default VideoForm;
