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

const componentSchema = z.object({
  long_name: z.string(),
  short_name: z.string(),
  types: z.array(z.string()),
});

const responseSchema = z.object({
  status: z.string(),
  results: z.array(
    z.object({
      types: z.array(z.string()),
      geometry: z.object({ location: z.object({ lat: z.number(), lng: z.number() }) }),
      address_components: z.array(componentSchema).default([]),
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

export const ADDRESS_FIELDS = ['streetAddress', 'city', 'state', 'postalCode'] as const;
type AddressField = (typeof ADDRESS_FIELDS)[number];

// The address Google has for a result. Brooklyn and the other boroughs come back without a
// locality, so they fall back to the borough.
function addressOf(components: z.infer<typeof componentSchema>[]) {
  const find = (type: string, name: 'long_name' | 'short_name' = 'long_name') =>
    components.find((component) => component.types.includes(type))?.[name];
  const route = find('route', 'short_name');
  const address: Partial<Record<AddressField, string>> = {
    streetAddress: route && [find('street_number'), route].filter(Boolean).join(' '),
    city: find('locality') ?? find('postal_town') ?? find('sublocality_level_1'),
    state: find('administrative_area_level_1', 'short_name'),
    postalCode: find('postal_code'),
  };
  return address;
}

// What a lookup adds to a venue: its coordinates, and whichever parts of its address it left
// empty. Null without an API key, when Google can't place the venue more precisely than its
// town, or when the lookup fails.
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
    const found = addressOf(place.address_components);
    const filled: Partial<Record<AddressField, string>> = {};
    for (const field of ADDRESS_FIELDS) {
      const value = found[field];
      if (value && !venue[field]?.trim()) {
        filled[field] = value;
      }
    }
    return {
      ...filled,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    };
  } catch (error) {
    logger.warn({ err: error, venue: venue.name }, 'Could not geocode venue');
    return null;
  }
}
