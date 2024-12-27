import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import FeaturedMedia from '~/components/FeaturedMedia';
import { Heading1 } from '~/components/Heading';
import Map from '~/components/Map';
import Shows from '~/components/Shows';
import Attended from '~/components/Shows/Attended';
import type { ImageUpload, VenueQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';

import type { Route } from './+types/venue';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  return query<VenueQuery>({
    request,
    context,
    query: venueQuery,
    variables: { first: 100, slug: params.slug },
  });
}

export const clientLoader = createClientCache();

export default function Venue({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { venue, shows, attended } = loaderData;

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
              <strong>{t('venues.capacity')}:</strong> {venue.capacity}
            </p>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className="text-pink underline"
            >
              {t('venues.website')} &rarr;
            </a>
          )}
          {venue.permanentlyClosed && (
            <p className="bg-pink rounded-lg p-2 font-bold text-white">
              {t('venues.permanentlyClosed')}.
            </p>
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
