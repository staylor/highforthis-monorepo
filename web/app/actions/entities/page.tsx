import { gql } from 'graphql-tag';
import qs from 'qs';
import { unsafeHTML, type Handle } from 'remix/component';

import { uploadUrl } from '../../lib/media.ts';
import type { ArtistQuery, VenueQuery } from '../../types/graphql.ts';
import { getApp } from '../../ui/app-context.tsx';
import { Metadata } from '../../ui/artist.tsx';
import { Heading1 } from '../../ui/heading.tsx';
import { Attended, attendedFragment, Shows, showsGridFragment } from '../../ui/shows/shows.tsx';

export const artistQuery = gql`
  query Artist($first: Int, $slug: String!) {
    artist(slug: $slug) {
      appleMusic {
        artwork {
          url
        }
        id
        url
      }
      id
      name
      website
    }
    attended: shows(artist: { slug: $slug }, attended: true, first: $first) {
      ...Attended_shows
    }
    shows(artist: { slug: $slug }, first: $first, latest: true) {
      ...ShowsGrid_shows
    }
  }
  ${attendedFragment}
  ${showsGridFragment}
`;

export function ArtistPage(handle: Handle<{ data: ArtistQuery }>) {
  return () => {
    const { artist, shows, attended } = handle.props.data;
    if (!artist) {
      return null;
    }
    return (
      <>
        <Heading1>{artist.name}</Heading1>
        <Metadata name={artist.name} website={artist.website} data={artist.appleMusic || {}} />
        {shows && <Shows shows={shows} />}
        {attended && <Attended shows={attended} relation="artist" />}
      </>
    );
  };
}

export const venueQuery = gql`
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
  ${attendedFragment}
  ${showsGridFragment}
`;

type Venue = NonNullable<VenueQuery['venue']>;

/** A static Google map linking to Apple Maps. */
function VenueMap(
  handle: Handle<{ name: string; coordinates: NonNullable<Venue['coordinates']> }>
) {
  const { root } = getApp(handle);
  const size = 300;

  return () => {
    const key = root.apiKeys?.googleMaps;
    if (!key) {
      return null;
    }
    const { name, coordinates } = handle.props;
    const center = `${coordinates.latitude},${coordinates.longitude}`;
    const params = {
      zoom: 15,
      center,
      size: `${size}x${size}`,
      key,
      style: 'feature:all|element:all|saturation:-100',
      markers: `size:normal|color:0xe50082|label:${name}|${center}`,
    };
    const src = `https://maps.googleapis.com/maps/api/staticmap?${qs.stringify(params)}&${qs.stringify({ style: 'feature:poi|visibility:off' })}`;
    return (
      <a
        class="mb-12 block md:mb-0"
        style={{ width: size, height: size }}
        href={`http://maps.apple.com/?${qs.stringify({ q: name, ll: center, z: 18 })}`}
      >
        <img width={size} height={size} class="block rounded-md" src={src} loading="lazy" alt="" />
      </a>
    );
  };
}

export function VenuePage(handle: Handle<{ data: VenueQuery }>) {
  const { t } = getApp(handle);

  return () => {
    const { venue, shows, attended } = handle.props.data;
    if (!venue) {
      return null;
    }
    return (
      <>
        {venue.featuredMedia?.map((media) => {
          const crop = 'crops' in media ? media.crops.find((c) => c.width === 640) : undefined;
          return crop ? (
            <img
              class="mb-4"
              alt=""
              loading="lazy"
              src={uploadUrl(media.destination, crop.fileName)}
            />
          ) : null;
        })}
        <Heading1>{venue.name}</Heading1>
        <div class="mb-6 justify-between md:my-8 md:flex">
          <div class="my-4 md:my-0 md:mr-4">
            {venue.address && (
              <p
                class="mb-3 text-sm text-muted dark:text-muted-dark"
                innerHTML={unsafeHTML(venue.address.replace(/\n/g, '<br />'))}
              />
            )}
            {venue.capacity && (
              <p class="mb-4 text-sm">
                <strong>{t('venues.capacity')}:</strong>{' '}
                <span class="text-muted dark:text-muted-dark">{venue.capacity}</span>
              </p>
            )}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                class="text-sm text-pink underline"
              >
                {t('venues.website')} →
              </a>
            )}
            {venue.permanentlyClosed && (
              <p class="mt-4 rounded-lg bg-pink p-2 text-sm font-bold text-white">
                {t('venues.permanentlyClosed')}.
              </p>
            )}
          </div>
          {venue.coordinates && <VenueMap name={venue.name} coordinates={venue.coordinates} />}
        </div>
        {shows && <Shows shows={shows} />}
        {attended && <Attended shows={attended} relation="venue" />}
      </>
    );
  };
}
