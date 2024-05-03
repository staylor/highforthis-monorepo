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

interface TermFormProps {
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

export default function TermForm({ data = {}, heading, buttonLabel }: TermFormProps) {
  const termFields: Fields = [
    {
      type: 'custom',
      condition: ({ term }) => term?.taxonomy?.slug === 'artist',
      render: ({ term }) =>
        term?.appleMusic?.artwork?.url && (
          <img
            src={data.term.appleMusic.artwork.url.replace(/\{[wh]\}/g, '300')}
            alt={data.term.name}
            className="my-4 rounded"
          />
        ),
    },
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
    {
      label: 'Shows',
      type: 'custom',
      render: ({ term, shows }) => {
        if (!term) {
          return null;
        }

        if (!shows?.edges || shows.edges.length === 0) {
          return 'No associated shows.';
        }

        const isArtist = term?.taxonomy?.slug === 'artist';

        return (
          <ul>
            {shows?.edges?.map(({ node }: ShowEdge, idx: number) => {
              const d = formatDate(node.date);
              return (
                <li key={idx.toString()} className="my-1">
                  <Link to={`/admin/show/${node.id}`} className="text-pink underline">
                    {d.formatted}/{d.year} {isArtist ? node.venue.name : node.artist.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      },
      position: 'meta',
      condition: ({ term }) => ['artist', 'venue'].includes(term?.taxonomy?.slug),
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      {data.term?.taxonomy.slug === 'venue' && (
        <>
          <HeaderAdd label="All Venues" to={`/admin/term/${data.term.taxonomy.id}`} />
          <PageLink url={`/venue/${data.term.slug}`}>View Venue</PageLink>
          <Message text="Venue updated." />
        </>
      )}
      {data.term?.taxonomy.slug === 'artist' && (
        <>
          <HeaderAdd label="All Artists" to={`/admin/term/${data.term.taxonomy.id}`} />
          <PageLink url={`/artist/${data.term.slug}`}>View Artist</PageLink>
          <Message text="Artist updated." />
        </>
      )}
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
      ... on Artist {
        appleMusic {
          artwork {
            url
          }
          id
        }
      }
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
