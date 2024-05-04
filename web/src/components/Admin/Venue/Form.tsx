import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';

import Link from '@/components/Link';
import { HeaderAdd, Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Input from '@/components/Form/Input';
import Message from '@/components/Form/Message';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import type { Fields } from '@/types';
import type { ShowEdge } from '@/types/graphql';
import { formatDate } from '@/components/Shows/utils';

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
    { label: 'Name', prop: 'name', render: ({ venue }) => venue?.name },
    {
      label: 'Slug',
      prop: 'slug',
      render: ({ venue }) => venue?.slug,
      condition: ({ venue }) => venue?.slug,
      editable: false,
    },
    {
      label: 'Description',
      prop: 'description',
      type: 'textarea',
      render: ({ venue }) => venue?.description,
    },
    {
      label: 'Website',
      prop: 'website',
      render: ({ venue }) => venue?.website,
    },
    {
      label: 'Capacity',
      prop: 'capacity',
      render: ({ venue }) => venue?.capacity,
    },
    {
      label: 'Address',
      prop: 'address',
      type: 'textarea',
      render: ({ venue }) => venue?.address,
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
    {
      label: 'Featured Media',
      prop: 'featuredMedia',
      type: 'custom',
      render: ({ venue }) => <FeaturedMedia media={venue?.featuredMedia || []} />,
    },
    {
      label: 'Shows',
      type: 'custom',
      render: ({ venue, shows }) => {
        if (!venue) {
          return null;
        }

        if (!shows?.edges || shows.edges.length === 0) {
          return 'No associated shows.';
        }

        return (
          <ul>
            {shows?.edges?.map(({ node }: ShowEdge, idx: number) => {
              const d = formatDate(node.date);
              return (
                <li key={idx.toString()} className="my-1">
                  <Link to={`/admin/show/${node.id}`} className="text-pink underline">
                    {d.formatted}/{d.year} {node.artist.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      },
      condition: ({ shows }) => shows?.length > 0,
      position: 'meta',
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
      address
      capacity
      coordinates {
        latitude
        longitude
      }
      description
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
