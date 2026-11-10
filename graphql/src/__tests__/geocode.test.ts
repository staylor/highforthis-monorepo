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

function result(types: string[], lat: number, lng: number) {
  return { types, geometry: { location: { lat, lng } } };
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
