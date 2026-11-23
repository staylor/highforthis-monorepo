import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import type { ArtistQuery, VenueQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Metadata } from '#/ui/artist.tsx';
import { Heading1 } from '#/ui/heading.tsx';
import { lines } from '#/ui/lines.tsx';
import { uploadUrl } from '#/ui/public/media.ts';
import { md, text } from '#/ui/public/styles.ts';
import { Attended, attendedFragment, Shows, showsGridFragment } from '#/ui/shows/shows.tsx';

export const artistQuery = gql`
  query Artist($first: Int, $slug: String!) {
    artist(slug: $slug) {
      id
      name
      website
      appleMusic {
        id
        url
        artwork {
          url
        }
      }
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
    apiKeys {
      googleMaps
    }
    attended: shows(attended: true, first: $first, venue: { slug: $slug }) {
      ...Attended_shows
    }
    shows(first: $first, latest: true, venue: { slug: $slug }) {
      ...ShowsGrid_shows
    }
    venue(slug: $slug) {
      id
      address
      capacity
      name
      permanentlyClosed
      website
      coordinates {
        latitude
        longitude
      }
      featuredMedia {
        id
        destination
        fileName
        type
        ... on ImageUpload {
          crops {
            fileName
            width
          }
        }
      }
    }
  }
  ${attendedFragment}
  ${showsGridFragment}
`;

type Venue = NonNullable<VenueQuery['venue']>;

/** A static Google map linking to Apple Maps. */
function VenueMap(
  handle: Handle<{
    name: string;
    coordinates: NonNullable<Venue['coordinates']>;
    /** Google Maps' key, without which there's no map. */
    mapsKey?: string | null;
  }>
) {
  const size = 300;

  return () => {
    const { name, coordinates, mapsKey: key } = handle.props;
    if (!key) {
      return null;
    }
    const center = `${coordinates.latitude},${coordinates.longitude}`;
    const params = new URLSearchParams([
      ['zoom', '15'],
      ['center', center],
      ['size', `${size}x${size}`],
      ['key', key],
      ['style', 'feature:all|element:all|saturation:-100'],
      ['markers', `size:normal|color:0xe50082|label:${name}|${center}`],
      ['style', 'feature:poi|visibility:off'],
    ]);
    const src = `https://maps.googleapis.com/maps/api/staticmap?${params}`;
    return (
      <a
        mix={css({
          marginBottom: '3rem',
          display: 'block',
          [md]: { marginBottom: 0 },
        })}
        style={{ width: size, height: size }}
        href={`http://maps.apple.com/?${new URLSearchParams({ q: name, ll: center, z: '18' })}`}
      >
        <img
          width={size}
          height={size}
          mix={css({ display: 'block', borderRadius: '0.375rem' })}
          src={src}
          loading="lazy"
          alt=""
        />
      </a>
    );
  };
}

export function VenuePage(handle: Handle<{ data: VenueQuery }>) {
  const { t } = getApp(handle);

  return () => {
    const { venue, shows, attended, apiKeys } = handle.props.data;
    if (!venue) {
      return null;
    }
    return (
      <>
        {venue.featuredMedia?.map((media) => {
          const crop = 'crops' in media ? media.crops.find((c) => c.width === 640) : undefined;
          return crop ? (
            <img
              mix={css({ marginBottom: '1rem' })}
              alt=""
              loading="lazy"
              src={uploadUrl(media.destination, crop.fileName)}
            />
          ) : null;
        })}
        <Heading1>{venue.name}</Heading1>
        <div
          mix={css({
            marginBottom: '1.5rem',
            justifyContent: 'space-between',
            [md]: { marginBlock: '2rem', display: 'flex' },
          })}
        >
          <div
            mix={css({
              marginBlock: '1rem',
              [md]: { marginBlock: 0, marginRight: '1rem' },
            })}
          >
            {venue.address && (
              <p
                mix={css({
                  marginBottom: '0.75rem',
                  ...text.sm,
                  color: 'var(--muted)',
                })}
              >
                {lines(venue.address)}
              </p>
            )}
            {venue.capacity && (
              <p mix={css({ marginBottom: '1rem', ...text.sm })}>
                <strong>{t('venues.capacity')}:</strong>{' '}
                <span mix={css({ color: 'var(--muted)' })}>{venue.capacity}</span>
              </p>
            )}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                mix={css({
                  ...text.sm,
                  color: 'var(--pink)',
                  textDecoration: 'underline',
                })}
              >
                {t('venues.website')} →
              </a>
            )}
            {venue.permanentlyClosed && (
              <p
                mix={css({
                  marginTop: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--pink)',
                  padding: '0.5rem',
                  ...text.sm,
                  fontWeight: 700,
                  color: '#fff',
                })}
              >
                {t('venues.permanentlyClosed')}.
              </p>
            )}
          </div>
          {venue.coordinates && (
            <VenueMap
              name={venue.name}
              coordinates={venue.coordinates}
              mapsKey={apiKeys?.googleMaps}
            />
          )}
        </div>
        {shows && <Shows shows={shows} />}
        {attended && <Attended shows={attended} relation="venue" />}
      </>
    );
  };
}
