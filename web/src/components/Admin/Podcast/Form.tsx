import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import FeaturedMedia from '~/components/Admin/Form/FeaturedMedia';
import { Heading } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Fields } from '~/types';
import type { Podcast } from '~/types/graphql';

interface PodcastFormProps {
  data?: Podcast;
  heading: string;
  buttonLabel: string;
}

export default function PodcastForm({
  data = {} as Podcast,
  heading,
  buttonLabel,
}: PodcastFormProps) {
  const { t } = useTranslation();
  const podcastFields: Fields = [
    { label: t('podcasts.title'), prop: 'title' },
    { label: t('podcasts.description'), prop: 'description', type: 'textarea' },
    {
      label: t('podcasts.image'),
      prop: 'image',
      type: 'custom',
      render: (p: Podcast) => (
        <FeaturedMedia
          className="mb-6"
          type="image"
          buttonText={t('podcasts.setImage')}
          media={p.image ? [p.image] : []}
        />
      ),
    },
    {
      label: t('podcasts.audio'),
      prop: 'audio',
      type: 'custom',
      render: (p: Podcast) => (
        <FeaturedMedia
          className="mb-6"
          type="audio"
          buttonText={t('podcasts.setAudio')}
          media={p.audio ? [p.audio] : []}
        />
      ),
    },
  ];

  return (
    <>
      <Heading>{heading}</Heading>
      <Message text={t('podcasts.updated')} />
      <Form data={data} fields={podcastFields} buttonLabel={buttonLabel} />
    </>
  );
}

PodcastForm.fragments = {
  podcast: gql`
    fragment PodcastForm_podcast on Podcast {
      audio {
        ...FeaturedMedia_media
        id
      }
      description
      id
      image {
        ...FeaturedMedia_media
        id
      }
      title
    }
    ${FeaturedMedia.fragments.media}
  `,
};
