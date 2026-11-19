// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { importListings, loadVenueListings } from '../listings';
import {
  createShow,
  deleteShows,
  importShows,
  loadNewShow,
  loadShow,
  loadShows,
  setShowAttended,
  updateShow,
} from '../shows';

import { calls, form, stubGraphQL } from './helpers';

describe('shows', () => {
  it('loads a page of shows, newest first', async () => {
    const gql = stubGraphQL();
    await loadShows({ gql, searchParams: new URLSearchParams('page=2&search=wilco') });
    expect(calls(gql.query)).toEqual([
      {
        operation: 'ShowsAdmin',
        variables: {
          order: 'DESC',
          first: 20,
          after: 'YXJyYXljb25uZWN0aW9uOjE5',
          search: 'wilco',
        },
      },
    ]);
  });

  it("sets a show's attended box from the list", async () => {
    const gql = stubGraphQL();
    await setShowAttended({ gql, formData: form({ id: 's1', attended: 'false' }) });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'UpdateShowAttended', variables: { id: 's1', input: { attended: false } } },
    ]);
  });

  it('deletes the checked shows', async () => {
    const gql = stubGraphQL();
    await deleteShows({
      gql,
      formData: form({ ids: ['s1', 's2'] }),
      url: new URL('http://localhost/admin/show'),
    });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'DeleteShow', variables: { ids: ['s1', 's2'] } },
    ]);
  });

  it('starts the add form from the last show added', async () => {
    const gql = stubGraphQL();
    await loadNewShow({ gql });
    expect(calls(gql.query)).toEqual([{ operation: 'ShowEntities', variables: undefined }]);
  });

  it('creates a show, unattended unless checked', async () => {
    const gql = stubGraphQL({ mutate: { createShow: { id: 's3' } } });
    const result = await createShow({
      gql,
      formData: form({ 'artists[]': ['a1', 'a2'], venue: 'v1', date: '1789000000000' }),
      url: new URL('http://localhost/admin/show/add'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'CreateShow',
        variables: {
          input: { attended: false, artists: ['a1', 'a2'], venue: 'v1', date: 1789000000000 },
        },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/show/s3?message=updated' });
  });

  it('loads a show to edit', async () => {
    const gql = stubGraphQL();
    await loadShow({ gql, id: 's1' });
    expect(calls(gql.query)).toEqual([{ operation: 'ShowEdit', variables: { id: 's1' } }]);
  });

  it('clears the fields and boxes the form leaves out', async () => {
    const gql = stubGraphQL({ mutate: { updateShow: { id: 's1' } } });
    const result = await updateShow({
      gql,
      id: 's1',
      formData: form({ title: '', notes: 'Great', attended: 'true' }),
      url: new URL('http://localhost/admin/show/s1'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'UpdateShow',
        variables: {
          id: 's1',
          input: { attended: true, notes: 'Great', title: null, url: null },
        },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/show/s1?message=updated' });
  });
});

describe('importShows', () => {
  const csv = 'artists,venue,date,attended\nWilco,The Venue,8/15/26,false';

  it('imports the CSV and reports the counts on the shows list', async () => {
    const gql = stubGraphQL({
      mutate: { bulkCreateShows: { artistsCreated: 1, showsCreated: 1, venuesCreated: 0 } },
    });
    const result = await importShows({ gql, formData: form({ csv }) });

    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'BulkCreateShows',
        variables: {
          input: [
            { artists: ['Wilco'], venue: 'The Venue', date: expect.any(Number), attended: false },
          ],
        },
      },
    ]);
    expect(result).toEqual({
      redirectTo: '/admin/show?artistsCreated=1&imported=1&venuesCreated=0',
    });
  });

  it("returns the CSV's errors without importing", async () => {
    const gql = stubGraphQL();
    const result = await importShows({ gql, formData: form({ csv: 'artists,venue,date\n,,' }) });

    expect(gql.mutate).not.toHaveBeenCalled();
    expect(result).toMatchObject({ csv: 'artists,venue,date\n,,' });
    expect('errors' in result && result.errors.length).toBeGreaterThan(0);
  });

  it('says so when the import fails', async () => {
    const result = await importShows({ gql: stubGraphQL(), formData: form({ csv }) });
    expect(result).toEqual({
      csv,
      errors: [{ line: 1, message: 'The shows could not be imported. Please try again.' }],
    });
  });
});

describe('venue listings', () => {
  it('loads only the venues until one is chosen', async () => {
    const gql = stubGraphQL();
    await loadVenueListings({ gql });
    await loadVenueListings({ gql, venueId: 'v1' });
    expect(calls(gql.query)).toEqual([
      { operation: 'VenueListingsAdmin', variables: { venueId: '', withListings: false } },
      { operation: 'VenueListingsAdmin', variables: { venueId: 'v1', withListings: true } },
    ]);
  });

  it('adds the checked listings with the artists entered for each', async () => {
    const gql = stubGraphQL({ mutate: { importListings: { artistsCreated: 2, showsCreated: 2 } } });
    const result = await importListings({
      gql,
      venueId: 'v1',
      formData: form({
        selected: ['L1', 'L2'],
        'artists-L1': 'Wilco; Spoon ;',
        'artists-L2': 'Big Thief',
        'artists-L3': 'Not checked',
      }),
    });

    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'ImportListings',
        variables: {
          venueId: 'v1',
          input: [
            { sourceId: 'L1', artists: ['Wilco', 'Spoon'] },
            { sourceId: 'L2', artists: ['Big Thief'] },
          ],
        },
      },
    ]);
    expect(result).toEqual({ redirectTo: '/admin/show/listings/v1?added=2&artistsCreated=2' });
  });

  it('says so when adding fails', async () => {
    const result = await importListings({
      gql: stubGraphQL(),
      venueId: 'v1',
      formData: form({ selected: 'L1', 'artists-L1': 'Wilco' }),
    });
    expect(result).toEqual({ failed: true });
  });
});
