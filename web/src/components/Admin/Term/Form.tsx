import { gql } from 'graphql-tag';

import { Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Input from '@/components/Form/Input';
import Message from '@/components/Form/Message';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import type { Fields } from '@/types';

interface TermFormProps {
  data?: any;
  heading: string;
  buttonLabel: string;
}

export default function TermForm({ data = {}, heading, buttonLabel }: TermFormProps) {
  const termFields: Fields = [
    {
      prop: 'taxonomy',
      type: 'hidden',
      render: ({ term, taxonomy }) => term?.taxonomy?.id || taxonomy?.id,
    },
    { label: 'Name', prop: 'name', render: ({ term }) => term?.name },
    {
      label: 'Slug',
      prop: 'slug',
      render: ({ term }) => term?.slug,
      condition: ({ term }) => term?.slug,
      editable: false,
    },
    {
      label: 'Description',
      prop: 'description',
      type: 'textarea',
      render: ({ term }) => term?.description,
    },
    {
      label: 'Website',
      prop: 'website',
      condition: ({ term }) => ['artist', 'venue'].includes(term?.taxonomy?.slug),
      render: ({ term }) => term?.website,
    },
    {
      label: 'Capacity',
      prop: 'capacity',
      condition: ({ term }) => term?.taxonomy?.slug === 'venue',
      render: ({ term }) => term?.capacity,
    },
    {
      label: 'Address',
      prop: 'address',
      type: 'textarea',
      condition: ({ term }) => ['venue'].includes(term?.taxonomy?.slug),
      render: ({ term }) => term?.address,
    },
    {
      label: 'Coordinates',
      prop: 'coordinates',
      type: 'custom',
      condition: ({ term }) => term?.taxonomy?.slug === 'venue',
      render: ({ term }) => (
        <>
          <Input
            placeholder="Latitude"
            name="coordinates[latitude]"
            value={term?.coordinates?.latitude}
          />
          <Input
            placeholder="Longitude"
            name="coordinates[longitude]"
            value={term?.coordinates?.longitude}
          />
        </>
      ),
    },
    {
      label: 'Featured Media',
      prop: 'featuredMedia',
      type: 'custom',
      render: ({ term }) => (term ? <FeaturedMedia media={term.featuredMedia || []} /> : null),
      condition: ({ term }) => ['artist', 'venue'].includes(term?.taxonomy?.slug),
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text="Term updated." />
      <Form data={data} fields={termFields} buttonLabel={buttonLabel} />
    </>
  );
}

TermForm.fragments = {
  term: gql`
    fragment TermForm_term on Term {
      description
      featuredMedia {
        ...FeaturedMedia_media
      }
      id
      name
      slug
      taxonomy {
        id
        name
        plural
        slug
      }
      website
      ... on Venue {
        address
        capacity
        coordinates {
          latitude
          longitude
        }
      }
    }
    ${FeaturedMedia.fragments.media}
  `,
};
