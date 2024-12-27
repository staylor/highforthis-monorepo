import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import FeaturedMedia from '~/components/Admin/Form/FeaturedMedia';
import { HeaderAdd, Heading } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Fields } from '~/types';

import {
  name,
  slug,
  description,
  website,
  featuredMedia,
  shows,
  excludeFromSearch,
} from '../Entity/Form';

interface ArtistFormProps {
  data?: any;
  heading: string;
  buttonLabel: string;
}

function PageLink({ url, children }: PropsWithChildren<{ url: string }>) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-pink mx-4 inline-block text-sm underline"
    >
      {children}
    </a>
  );
}

export default function ArtistForm({ data = {}, heading, buttonLabel }: ArtistFormProps) {
  const { t, i18n } = useTranslation();
  const fields: Fields = [
    {
      type: 'custom',
      render: ({ artist }) =>
        artist?.appleMusic?.artwork?.url && (
          <img
            src={artist.appleMusic.artwork.url.replace(/\{[wh]\}/g, '300')}
            alt={artist.name}
            className="my-4 rounded"
          />
        ),
    },
    name('artist', i18n),
    slug('artist', i18n),
    description('artist', i18n),
    website('artist', i18n),
    featuredMedia('artist', i18n),
    shows('venue', i18n),
    excludeFromSearch('artist', i18n),
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <HeaderAdd label={t('artists.all')} to="/admin/artist" />
      {data.artist && <PageLink url={`/artist/${data.artist.slug}`}>{t('artist.view')}</PageLink>}
      <Message text={t('artists.updated')} />
      <Form data={data} fields={fields} buttonLabel={buttonLabel} />
    </>
  );
}

ArtistForm.fragments = {
  artist: gql`
    fragment ArtistForm_artist on Artist {
      appleMusic {
        artwork {
          url
        }
        id
      }
      description
      excludeFromSearch
      featuredMedia {
        ...FeaturedMedia_media
      }
      id
      name
      slug
      website
    }
    ${FeaturedMedia.fragments.media}
  `,
};
