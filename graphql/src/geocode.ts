import { createLogger } from '@highforthis/shared/logger';
import { z } from 'zod';

import env from '#/env';

const API = 'https://maps.googleapis.com/maps/api/geocode/json';

// A result no more precise than these would pin the venue in the middle of its town
const COARSE_TYPES: Record<string, true> = {
  administrative_area_level_1: true,
  administrative_area_level_2: true,
  administrative_area_level_3: true,
  colloquial_area: true,
  country: true,
  locality: true,
  neighborhood: true,
  political: true,
  postal_code: true,
  sublocality: true,
  sublocality_level_1: true,
};

const responseSchema = z.object({
  status: z.string(),
  results: z.array(
    z.object({
      types: z.array(z.string()),
      geometry: z.object({ location: z.object({ lat: z.number(), lng: z.number() }) }),
    })
  ),
});

const logger = createLogger({ serviceName: 'graphql' });

interface Place {
  name: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

// Coordinates for a venue from its name and address, or null without an API key, when Google
// can't place it more precisely than its town, or when the lookup fails
export async function geocodeVenue(venue: Place) {
  const apiKey = env.GOOGLE_MAPS_GEOLOCATION_API_KEY;
  if (!apiKey || !(venue.streetAddress || venue.city)) {
    return null;
  }

  const region = [venue.state, venue.postalCode].filter(Boolean).join(' ');
  const url = new URL(API);
  url.searchParams.set(
    'address',
    [venue.name, venue.streetAddress?.trim(), venue.city, region].filter(Boolean).join(', ')
  );
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const { status, results } = responseSchema.parse(await response.json());
    const [place] = status === 'OK' ? results : [];
    if (!place || place.types.every((type) => COARSE_TYPES[type])) {
      return null;
    }
    return { latitude: place.geometry.location.lat, longitude: place.geometry.location.lng };
  } catch (error) {
    logger.warn({ err: error, venue: venue.name }, 'Could not geocode venue');
    return null;
  }
}
