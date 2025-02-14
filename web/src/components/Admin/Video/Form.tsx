import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import { Heading } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Fields } from '~/types';
import type { Video } from '~/types/graphql';

type VideoFormProps = PropsWithChildren<{
  data?: Partial<Video>;
  heading: string;
  buttonLabel: string;
}>;

function VideoForm({ data = {}, heading, buttonLabel, children = null }: VideoFormProps) {
  const { t } = useTranslation();
  const videoFields: Fields = [
    { label: t('videos.title'), prop: 'title' },
    { label: t('videos.slug'), prop: 'slug' },
    { label: t('videos.type'), prop: 'dataType' },
    {
      label: t('videos.playlist'),
      prop: 'dataPlaylistId',
      type: 'custom',
      render: (video: Video) => (
        <a
          className="underline"
          href={`https://www.youtube.com/playlist?list=${video.dataPlaylistId}`}
        >
          {t('videos.viewPlaylist', { year: video.year })}
        </a>
      ),
    },
  ];

  return (
    <>
      <Heading>{heading}</Heading>
      <Message text={t('videos.updated')} />
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
