import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';

import {
  name,
  slug,
  description,
  website,
  featuredMedia,
  shows,
  excludeFromSearch,
} from '../Entity/Form';

import Form from '@/components/Admin/Form';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import { HeaderAdd, Heading } from '@/components/Admin/styles';
import Checkbox from '@/components/Form/Checkbox';
import Input from '@/components/Form/Input';
import Message from '@/components/Form/Message';
import type { Fields } from '@/types';

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
      className="mx-4 inline-block text-sm text-pink underline"
    >
      {children}
    </a>
  );
}

export default function VenueForm({ data = {}, heading, buttonLabel }: VenueFormProps) {
  const fields: Fields = [
    name('venue'),
    slug('venue'),
    description('venue'),
    website('venue'),
    {
      label: 'Capacity',
      prop: 'capacity',
      render: ({ venue }) => venue?.capacity,
    },
    {
      label: 'Street Address',
      prop: 'streetAddress',
      type: 'textarea',
      render: ({ venue }) => venue?.streetAddress,
    },
    {
      label: 'City',
      prop: 'city',
      render: ({ venue }) => venue?.city,
    },
    {
      label: 'State',
      prop: 'state',
      render: ({ venue }) => venue?.state,
    },
    {
      label: 'Postal Code',
      prop: 'postalCode',
      render: ({ venue }) => venue?.postalCode,
    },
    {
      label: 'Coordinates',
      prop: 'coordinates',
      type: 'custom',
      render: ({ venue }) => (
        <>
          <Input
            placeholder="Latitude"
            name="coordinates[latitude]"
            value={venue?.coordinates?.latitude}
          />
          <Input
            placeholder="Longitude"
            name="coordinates[longitude]"
            value={venue?.coordinates?.longitude}
          />
        </>
      ),
    },
    featuredMedia('venue'),
    shows('artists'),
    excludeFromSearch('venue'),
    {
      label: 'Permanently closed',
      type: 'custom',
      render: ({ venue }) => (
        <Checkbox name="permanentlyClosed" checked={venue?.permanentlyClosed} />
      ),
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <HeaderAdd label="All Venues" to="/admin/venue" />
      {data.venue && <PageLink url={`/venue/${data.venue.slug}`}>View Venue</PageLink>}
      <Message text="Venue updated." />
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
