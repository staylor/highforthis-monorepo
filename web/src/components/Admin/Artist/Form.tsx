import { gql } from 'graphql-tag';
import type { PropsWithChildren } from 'react';

import Link from '@/components/Link';
import { HeaderAdd, Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Message from '@/components/Form/Message';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import type { Fields } from '@/types';
import type { ShowEdge } from '@/types/graphql';
import { formatDate } from '@/components/Shows/utils';

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
    { label: 'Name', prop: 'name', render: ({ artist }) => artist?.name },
    {
      label: 'Slug',
      prop: 'slug',
      render: ({ artist }) => artist?.slug,
      condition: ({ artist }) => artist?.slug,
      editable: false,
    },
    {
      label: 'Description',
      prop: 'description',
      type: 'textarea',
      render: ({ artist }) => artist?.description,
    },
    {
      label: 'Website',
      prop: 'website',
      render: ({ artist }) => artist?.website,
    },
    {
      label: 'Featured Media',
      prop: 'featuredMedia',
      type: 'custom',
      render: ({ artist }) => <FeaturedMedia media={artist?.featuredMedia || []} />,
    },
    {
      label: 'Shows',
      type: 'custom',
      render: ({ artist, shows }) => {
        if (!artist) {
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
                    {d.formatted}/{d.year} {node.venue.name}
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
