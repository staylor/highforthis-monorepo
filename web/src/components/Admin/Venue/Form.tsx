import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import FeaturedMedia from '~/components/Admin/Form/FeaturedMedia';
import { HeaderAdd, Heading } from '~/components/Admin/styles';
import Checkbox from '~/components/Form/Checkbox';
import Input from '~/components/Form/Input';
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

interface VenueFormProps {
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

export default function VenueForm({ data = {}, heading, buttonLabel }: VenueFormProps) {
  const { t, i18n } = useTranslation();
  const fields: Fields = [
    name('venue', i18n),
    slug('venue', i18n),
    description('venue', i18n),
    website('venue', i18n),
    {
      label: t('venues.capacity'),
      prop: 'capacity',
      render: ({ venue }) => venue?.capacity,
    },
    {
      label: t('venues.streetAddress'),
      prop: 'streetAddress',
      type: 'textarea',
      render: ({ venue }) => venue?.streetAddress,
    },
    {
      label: t('venues.city'),
      prop: 'city',
      render: ({ venue }) => venue?.city,
    },
    {
      label: t('venues.state'),
      prop: 'state',
      render: ({ venue }) => venue?.state,
    },
    {
      label: t('venues.postalCode'),
      prop: 'postalCode',
      render: ({ venue }) => venue?.postalCode,
    },
    {
      label: t('venues.coordinates'),
      prop: 'coordinates',
      type: 'custom',
      render: ({ venue }) => (
        <>
          <Input
            placeholder={t('venues.latitude')}
            name="coordinates[latitude]"
            value={venue?.coordinates?.latitude}
          />
          <Input
            placeholder={t('venues.longitude')}
            name="coordinates[longitude]"
            value={venue?.coordinates?.longitude}
          />
        </>
      ),
    },
    featuredMedia('venue', i18n),
    shows('artists', i18n),
    excludeFromSearch('venue', i18n),
    {
      label: t('venues.permanentlyClosed'),
      type: 'custom',
      render: ({ venue }) => (
        <Checkbox name="permanentlyClosed" checked={venue?.permanentlyClosed} />
      ),
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <HeaderAdd label={t('venues.all')} to="/admin/venue" />
      {data.venue && <PageLink url={`/venue/${data.venue.slug}`}>{t('venues.view')}</PageLink>}
      <Message text={t('venues.updated')} />
      <Form data={data} fields={fields} buttonLabel={buttonLabel} />
    </>
  );
}

VenueForm.fragments = {
  venue: gql`
    fragment VenueForm_venue on Venue {
      capacity
      city
      coordinates {
        latitude
        longitude
      }
      description
      excludeFromSearch
      featuredMedia {
        ...FeaturedMedia_media
      }
      id
      name
      permanentlyClosed
      postalCode
      slug
      state
      streetAddress
      website
    }
    ${FeaturedMedia.fragments.media}
  `,
};
