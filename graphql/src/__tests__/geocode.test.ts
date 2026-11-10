import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import env from '#/env';
import { geocodeVenue } from '#/geocode';

const RYMAN = {
  name: 'Ryman Auditorium',
  streetAddress: '116 Rep. John Lewis Way N',
  city: 'Nashville',
  state: 'TN',
  postalCode: '37219',
};

function respond(body: unknown) {
  const requests: URL[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: URL) => {
      requests.push(new URL(url));
      return Response.json(body);
    })
  );
  return requests;
}

function result(types: string[], lat: number, lng: number, components: unknown[] = []) {
  return { types, geometry: { location: { lat, lng } }, address_components: components };
}

function component(longName: string, shortName: string, types: string[]) {
  return { long_name: longName, short_name: shortName, types };
}

// Google's address for Brooklyn Steel, which has a borough but no locality
const BROOKLYN_STEEL = [
  component('319', '319', ['street_number']),
  component('Frost Street', 'Frost St', ['route']),
  component('East Williamsburg', 'East Williamsburg', ['neighborhood', 'political']),
  component('Brooklyn', 'Brooklyn', ['political', 'sublocality', 'sublocality_level_1']),
  component('Kings County', 'Kings County', ['administrative_area_level_2', 'political']),
  component('New York', 'NY', ['administrative_area_level_1', 'political']),
  component('United States', 'US', ['country', 'political']),
  component('11222', '11222', ['postal_code']),
  component('5701', '5701', ['postal_code_suffix']),
];

function brooklynSteel() {
  return respond({
    status: 'OK',
    results: [result(['establishment', 'point_of_interest'], 40.7194, -73.9388, BROOKLYN_STEEL)],
  });
}

const { GOOGLE_MAPS_GEOLOCATION_API_KEY } = env;

describe('geocodeVenue', () => {
  beforeEach(() => {
    env.GOOGLE_MAPS_GEOLOCATION_API_KEY = 'test-key';
  });

  afterEach(() => {
    env.GOOGLE_MAPS_GEOLOCATION_API_KEY = GOOGLE_MAPS_GEOLOCATION_API_KEY;
    vi.unstubAllGlobals();
  });

  it('looks the venue up by name and address', async () => {
    const requests = respond({
      status: 'OK',
      results: [result(['establishment', 'point_of_interest'], 36.1612, -86.7785)],
    });

    await expect(geocodeVenue(RYMAN)).resolves.toEqual({ latitude: 36.1612, longitude: -86.7785 });
    expect(requests[0].searchParams.get('address')).toBe(
      'Ryman Auditorium, 116 Rep. John Lewis Way N, Nashville, TN 37219'
    );
  });

  it('fills in the parts of the address the venue left empty', async () => {
    brooklynSteel();

    await expect(
      geocodeVenue({ name: 'Brooklyn Steel', city: 'Williamsburg', state: 'NY' })
    ).resolves.toEqual({
      latitude: 40.7194,
      longitude: -73.9388,
      streetAddress: '319 Frost St',
      postalCode: '11222',
    });
  });

  it('takes the city from the borough when Google has no town', async () => {
    brooklynSteel();

    await expect(
      geocodeVenue({ name: 'Brooklyn Steel', streetAddress: '319 Frost St' })
    ).resolves.toEqual({
      latitude: 40.7194,
      longitude: -73.9388,
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11222',
    });
  });

  it("ignores a match that only finds the venue's town", async () => {
    respond({ status: 'OK', results: [result(['locality', 'political'], 30.588, -84.591)] });

    await expect(
      geocodeVenue({ name: 'Down on the Farm', city: 'Quincy', state: 'FL' })
    ).resolves.toBeNull();
  });

  it('skips the lookup without an API key or an address', async () => {
    const requests = respond({ status: 'OK', results: [] });

    await expect(geocodeVenue({ name: 'Somewhere' })).resolves.toBeNull();
    env.GOOGLE_MAPS_GEOLOCATION_API_KEY = undefined;
    await expect(geocodeVenue(RYMAN)).resolves.toBeNull();
    expect(requests).toHaveLength(0);
  });

  it('gives up when Google fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    await expect(geocodeVenue(RYMAN)).resolves.toBeNull();
  });
});
