// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  createVenue,
  deleteVenues,
  loadVenue,
  loadVenues,
  setVenueFlag,
  updateVenue,
} from '../venues';

import { calls, form, stubGraphQL } from './helpers';

describe('venues', () => {
  it('loads a page of venues, searched', async () => {
    const gql = stubGraphQL();
    await loadVenues({ gql, searchParams: new URLSearchParams('search=bowery') });
    expect(calls(gql.query)).toEqual([
      { operation: 'VenuesAdmin', variables: { first: 20, search: 'bowery' } },
    ]);
  });

  it.each([
    ['excludeFromSearch', { excludeFromSearch: true }],
    ['permanentlyClosed', { permanentlyClosed: true }],
  ])("sets a venue's %s box from the list", async (formAction, input) => {
    const gql = stubGraphQL();
    await setVenueFlag({
      gql,
      formData: form({ id: 'v1', [formAction]: 'true', formAction }),
    });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'UpdateVenueExclude', variables: { id: 'v1', input } },
    ]);
  });

  it('deletes the checked venues', async () => {
    const gql = stubGraphQL();
    const result = await deleteVenues({
      gql,
      formData: form({ ids: ['v1'] }),
      url: new URL('http://localhost/admin/venue'),
    });
    expect(calls(gql.mutate)).toEqual([{ operation: 'DeleteVenue', variables: { ids: ['v1'] } }]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/venue?deleted=1' });
  });

  it('loads a venue with its shows', async () => {
    const gql = stubGraphQL();
    await loadVenue({ gql, id: 'v1' });
    expect(calls(gql.query)).toEqual([{ operation: 'VenueEdit', variables: { id: 'v1' } }]);
  });

  it('creates a venue, keeping the postal code and capacity as typed', async () => {
    const gql = stubGraphQL({ mutate: { createVenue: { id: 'v2' } } });
    const result = await createVenue({
      gql,
      formData: form({ name: 'Paradise', postalCode: '02134', capacity: '933' }),
      url: new URL('http://localhost/admin/venue/add'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'CreateVenue',
        variables: { input: { name: 'Paradise', postalCode: '02134', capacity: '933' } },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/venue/v2?message=updated' });
  });

  it('clears the fields and boxes the form leaves out', async () => {
    const gql = stubGraphQL();
    await updateVenue({
      gql,
      id: 'v1',
      formData: form({ name: 'Paradise', postalCode: '02134', listingsUrl: '' }),
      url: new URL('http://localhost/admin/venue/v1'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'UpdateVenue',
        variables: {
          id: 'v1',
          input: {
            excludeFromSearch: false,
            listingsUrl: null,
            permanentlyClosed: false,
            name: 'Paradise',
            postalCode: '02134',
          },
        },
      },
    ]);
  });
});
