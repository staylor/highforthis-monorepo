// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  createArtist,
  deleteArtists,
  loadArtist,
  loadArtists,
  setArtistExcludeFromSearch,
  updateArtist,
} from '../artists';

import { calls, form, stubGraphQL } from './helpers';

describe('artists', () => {
  it('loads a page of artists, searched', async () => {
    const gql = stubGraphQL();
    await loadArtists({ gql, searchParams: new URLSearchParams('page=2&search=spoon') });
    expect(calls(gql.query)).toEqual([
      {
        operation: 'ArtistsAdmin',
        variables: { first: 20, after: 'YXJyYXljb25uZWN0aW9uOjE5', search: 'spoon' },
      },
    ]);
  });

  it("sets an artist's exclude-from-search box from the list", async () => {
    const gql = stubGraphQL({ mutate: { updateArtist: { id: 'a1' } } });
    const result = await setArtistExcludeFromSearch({
      gql,
      formData: form({ id: 'a1', excludeFromSearch: 'true', formAction: 'excludeFromSearch' }),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'UpdateArtistExclude',
        variables: { id: 'a1', input: { excludeFromSearch: true } },
      },
    ]);
    expect(result).toEqual({ updateArtist: { id: 'a1' } });
  });

  it('deletes the checked artists', async () => {
    const gql = stubGraphQL();
    await deleteArtists({
      gql,
      formData: form({ ids: ['a1', 'a2'] }),
      url: new URL('http://localhost/admin/artist'),
    });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'DeleteArtist', variables: { ids: ['a1', 'a2'] } },
    ]);
  });

  it('loads an artist with their shows', async () => {
    const gql = stubGraphQL();
    await loadArtist({ gql, id: 'a1' });
    expect(calls(gql.query)).toEqual([{ operation: 'ArtistEdit', variables: { id: 'a1' } }]);
  });

  it('creates an artist, keeping a numeric name a string', async () => {
    const gql = stubGraphQL({ mutate: { createArtist: { id: 'a3' } } });
    const result = await createArtist({
      gql,
      formData: form({ name: '311', slug: '311', website: 'https://311.com' }),
      url: new URL('http://localhost/admin/artist/add'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'CreateArtist',
        variables: { input: { name: '311', slug: '311', website: 'https://311.com' } },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/artist/a3?message=updated' });
  });

  it('clears exclude-from-search when the box is unchecked', async () => {
    const gql = stubGraphQL();
    await updateArtist({
      gql,
      id: 'a1',
      formData: form({ name: 'Wilco' }),
      url: new URL('http://localhost/admin/artist/a1'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'UpdateArtist',
        variables: { id: 'a1', input: { excludeFromSearch: false, name: 'Wilco' } },
      },
    ]);
  });

  it('keeps exclude-from-search when the box is checked', async () => {
    const gql = stubGraphQL();
    await updateArtist({
      gql,
      id: 'a1',
      formData: form({ name: 'Wilco', excludeFromSearch: 'true' }),
      url: new URL('http://localhost/admin/artist/a1'),
    });
    expect(gql.mutate.mock.calls[0][1]).toEqual({
      id: 'a1',
      input: { excludeFromSearch: true, name: 'Wilco' },
    });
  });
});
