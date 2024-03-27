import { gql } from 'graphql-tag';

import { Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Input from '@/components/Form/Input';
import Message from '@/components/Form/Message';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import Tags from '@/components/Admin/Form/Tags';
import type { Fields } from '@/types';
import type { Term, TermEdge } from '@/types/graphql';

interface TermFormProps {
  data?: any;
  heading: string;
  buttonLabel: string;
}

export default function TermForm({ data = {}, heading, buttonLabel }: TermFormProps) {
  const { neighborhoods } = data;
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
      label: 'Capacity',
      prop: 'capacity',
      condition: ({ term }) => term?.taxonomy?.slug === 'venue',
      render: ({ term }) => term?.capacity,
    },
    {
      label: 'Address',
      prop: 'address',
      type: 'textarea',
      condition: ({ term }) => ['venue', 'place'].includes(term?.taxonomy?.slug),
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
      condition: ({ term }) => ['artist', 'venue', 'place'].includes(term?.taxonomy?.slug),
    },
    {
      label: 'Neighborhood',
      prop: 'neighborhood',
      type: 'select',
      placeholder: '---',
      choices: neighborhoods.edges.map(({ node }: TermEdge) => ({
        label: node.name,
        value: node.id,
      })),
      render: ({ term }) => term?.neighborhood?.id,
      condition: ({ term }) => term?.taxonomy?.slug === 'place',
      position: 'meta',
    },
    {
      label: 'Categories',
      prop: 'categories',
      type: 'custom',
      condition: ({ term }) => term?.taxonomy?.slug === 'place',
      render: ({ term }) => {
        let tags = term?.categories
          ? term.categories.filter((t: Term) => t && t.name).map((t: Term) => t.name)
          : [];
        return <Tags name="categories" tags={tags} />;
      },
      position: 'meta',
    },
    {
      label: 'Cross Streets',
      prop: 'crossStreets',
      type: 'custom',
      condition: ({ term }) => term?.taxonomy?.slug === 'place',
      render: ({ term }) => {
        let tags = term?.crossStreets
          ? term.crossStreets.filter((t: Term) => t && t.name).map((t: Term) => t.name)
          : [];
        return <Tags name="crossStreets" tags={tags} />;
      },
      position: 'meta',
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
      ... on Venue {
        address
        capacity
        coordinates {
          latitude
          longitude
        }
      }
      ... on Place {
        address
        categories {
          id
          name
        }
        crossStreets {
          id
          name
        }
        neighborhood {
          id
          name
        }
      }
    }
    ${FeaturedMedia.fragments.media}
  `,
  terms: gql`
    fragment TermForm_terms on TermConnection {
      edges {
        node {
          id
          name
        }
      }
      taxonomy {
        id
      }
    }
  `,
};
