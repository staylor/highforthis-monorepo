import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import FeaturedMedia from '~/components/FeaturedMedia';
import { Heading1 } from '~/components/Heading';
import Map from '~/components/Map';
import Shows from '~/components/Shows';
import Attended from '~/components/Shows/Attended';
import type { ImageUpload, ShowConnection, Venue as VenueType, VenueQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({ context, query: venueQuery, variables: { first: 100, slug: params.slug } });
};

export const clientLoader = createClientCache();

export default function Venue() {
  const data = useLoaderData<VenueQuery>();
  const venue = data.venue as VenueType;
  const shows = data.shows as ShowConnection;
  const attended = data.attended as ShowConnection;

  return (
    <>
      <FeaturedMedia featuredMedia={venue.featuredMedia as ImageUpload[]} />
      <Heading1>{venue.name}</Heading1>
      <div className="mb-4 justify-between md:my-10 md:flex">
        <div className="my-4 md:my-0 md:mr-4">
          {venue.address && (
            <p
              className="mb-3"
              dangerouslySetInnerHTML={{ __html: venue.address.replace(/\n/g, '<br />') }}
            />
          )}
          {venue.capacity && (
            <p className="mb-5">
              <strong>Capacity:</strong> {venue.capacity}
            </p>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className="text-pink underline"
            >
              Venue Website &rarr;
            </a>
          )}
          {venue.permanentlyClosed && (
            <p className="rounded-lg bg-pink p-2 font-bold text-white">Permanently Closed.</p>
          )}
        </div>
        {venue.coordinates && (
          <Map className="rounded-md" name={venue.name} coordinates={venue.coordinates} />
        )}
      </div>
      <Shows shows={shows} />
      <Attended shows={attended} relation="venue" />
    </>
  );
}

const venueQuery = gql`
  query Venue($first: Int, $slug: String!) {
    attended: shows(attended: true, first: $first, venue: { slug: $slug }) {
      ...Attended_shows
    }
    shows(first: $first, latest: true, venue: { slug: $slug }) {
      ...ShowsGrid_shows
    }
    venue(slug: $slug) {
      address
      capacity
      coordinates {
        latitude
        longitude
      }
      featuredMedia {
        destination
        fileName
        id
        type
        ... on ImageUpload {
          crops {
            fileName
            width
          }
        }
      }
      id
      name
      permanentlyClosed
      website
    }
  }
  ${Attended.fragments.shows}
  ${Shows.fragments.shows}
`;
