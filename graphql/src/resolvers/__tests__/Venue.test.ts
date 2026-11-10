import type { Venue } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Venue';

const { update, geocodeVenue } = vi.hoisted(() => ({
  update: vi.fn(),
  geocodeVenue: vi.fn(),
}));

vi.mock('#/database', () => ({ default: { venue: { update } } }));
vi.mock('#/geocode', () => ({ geocodeVenue }));

function venue(fields: Partial<Venue>) {
  return {
    id: 'venue-1',
    name: 'Brooklyn Steel',
    streetAddress: null,
    city: null,
    state: null,
    postalCode: null,
    latitude: null,
    longitude: null,
    ...fields,
  } as Venue;
}

function address(fields: Partial<Venue>) {
  return resolvers.Venue.address(venue(fields));
}

describe('venue.address', () => {
  it('puts the street over the city, state and postal code', () => {
    expect(
      address({
        streetAddress: '319 Frost St',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11222',
      })
    ).toBe('319 Frost St\nBrooklyn, NY 11222');
  });

  it('leaves out the parts that are missing', () => {
    expect(address({ city: 'Quincy', state: 'FL', postalCode: '' })).toBe('Quincy, FL');
    expect(address({ streetAddress: 'Spanish Moss Farm', city: 'Quincy' })).toBe(
      'Spanish Moss Farm\nQuincy'
    );
  });

  it('is null without any address', () => {
    expect(address({ postalCode: '' })).toBeNull();
  });
});

describe('updateVenue', () => {
  const saved = { streetAddress: '319 Frost St', city: 'Brooklyn', state: 'NY' };

  beforeEach(() => {
    update.mockReset();
    geocodeVenue.mockReset();
  });

  it('looks up coordinates when an address is saved without them', async () => {
    update.mockImplementation(async ({ data }) => venue({ ...saved, ...data }));
    geocodeVenue.mockResolvedValue({ latitude: 40.7193, longitude: -73.9389 });

    const result = await resolvers.Mutation.updateVenue({}, { id: 'venue-1', input: saved });

    expect(result).toMatchObject({ latitude: 40.7193, longitude: -73.9389 });
  });

  it('keeps the coordinates a venue has', async () => {
    update.mockResolvedValue(venue({ ...saved, latitude: 40.7, longitude: -73.9 }));

    await resolvers.Mutation.updateVenue({}, { id: 'venue-1', input: saved });

    expect(geocodeVenue).not.toHaveBeenCalled();
  });

  it("doesn't look anything up when the address wasn't saved", async () => {
    update.mockResolvedValue(venue({}));

    await resolvers.Mutation.updateVenue({}, { id: 'venue-1', input: { excludeFromSearch: true } });

    expect(geocodeVenue).not.toHaveBeenCalled();
  });
});
