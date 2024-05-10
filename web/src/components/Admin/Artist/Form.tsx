import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';

import { HeaderAdd, Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Message from '@/components/Form/Message';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import type { Fields } from '@/types';

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
      className="mx-4 inline-block text-sm text-pink underline"
    >
      {children}
    </a>
  );
}

export default function ArtistForm({ data = {}, heading, buttonLabel }: ArtistFormProps) {
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
    name('artist'),
    slug('artist'),
    description('artist'),
    website('artist'),
    featuredMedia('artist'),
    shows('venue'),
    excludeFromSearch('artist'),
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <HeaderAdd label="All Artists" to="/admin/artist" />
      {data.artist && <PageLink url={`/artist/${data.artist.slug}`}>View Artist</PageLink>}
      <Message text="Artist updated." />
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
