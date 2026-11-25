import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { ArtistQuery, ShowsGrid_ShowsFragment, VenueQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { ArtistLinks, Billing } from '#/ui/artist.tsx';
import { lines } from '#/ui/lines.tsx';
import { PageHeader } from '#/ui/page-header.tsx';
import { uploadUrl } from '#/ui/public/media.ts';
import { md, pinkButton, text } from '#/ui/public/styles.ts';
import { SectionHeader } from '#/ui/section-header.tsx';
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

/**
 * The shows coming up for an artist or at a venue, under the heading the home page gives its own.
 * Nothing when there are none.
 */
function Upcoming(handle: Handle<{ shows?: ShowsGrid_ShowsFragment | null; hideVenue?: boolean }>) {
  const { t } = getApp(handle);

  return () => {
    const { shows, hideVenue } = handle.props;
    if (!shows?.edges.length) {
      return null;
    }
    return (
      <section mix={css({ marginTop: '3rem' })}>
        <SectionHeader
          label={t('shows.recommended')}
          viewAllLink={routes.shows.index.href()}
          viewAllText={t('shows.fullCalendar')}
        />
        <Shows shows={shows} hideVenue={hideVenue} />
      </section>
    );
  };
}

export function ArtistPage(handle: Handle<{ data: ArtistQuery }>) {
  const { t } = getApp(handle);

  return () => {
    const { artist, shows, attended } = handle.props.data;
    if (!artist) {
      return null;
    }
    return (
      <>
        <Billing name={artist.name} data={artist.appleMusic}>
          <PageHeader
            eyebrow={t('artists.label')}
            title={artist.name}
            styles={{ marginBottom: '1.25rem' }}
          />
          <ArtistLinks website={artist.website} data={artist.appleMusic || {}} />
        </Billing>
        <Upcoming shows={shows} />
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
          display: 'block',
          flexShrink: 0,
          overflow: 'hidden',
          width: size,
          maxWidth: '100%',
          borderRadius: '0.75rem',
          boxShadow: 'var(--shadow-lg)',
        })}
        href={`https://maps.apple.com/?${new URLSearchParams({ q: name, ll: center, z: '18' })}`}
      >
        <img width={size} height={size} src={src} loading="lazy" alt="" />
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
              mix={css({ marginBottom: '1.5rem', borderRadius: '0.75rem' })}
              alt=""
              loading="lazy"
              src={uploadUrl(media.destination, crop.fileName)}
            />
          ) : null;
        })}
        <div
          mix={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            [md]: { flexDirection: 'row', justifyContent: 'space-between' },
          })}
        >
          <div>
            <PageHeader
              eyebrow={t('venues.label')}
              title={venue.name}
              styles={{ marginBottom: '1.25rem' }}
            />
            {venue.permanentlyClosed && (
              <p
                mix={css({
                  marginBottom: '1rem',
                  display: 'inline-block',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--pink)',
                  padding: '0.25rem 0.75rem',
                  ...text.sm,
                  fontWeight: 700,
                  color: '#fff',
                })}
              >
                {t('venues.permanentlyClosed')}.
              </p>
            )}
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
              <p mix={css({ marginBottom: '1.25rem', ...text.sm })}>
                <strong>{t('venues.capacity')}:</strong>{' '}
                <span mix={css({ color: 'var(--muted)' })}>{venue.capacity}</span>
              </p>
            )}
            {venue.website && (
              <a href={venue.website} target="_blank" rel="noreferrer" mix={css(pinkButton)}>
                {t('venues.website')} →
              </a>
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
        <Upcoming shows={shows} hideVenue />
        {attended && <Attended shows={attended} relation="venue" />}
      </>
    );
  };
}
