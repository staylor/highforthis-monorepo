// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  addAlbumCovers,
  deleteMedia,
  loadMedia,
  loadMediaList,
  searchAlbumCovers,
  updateMedia,
} from '../media';

import { calls, form, stubGraphQL } from './helpers';

describe('media', () => {
  it('loads a page of media, filtered', async () => {
    const gql = stubGraphQL();
    await loadMediaList({
      gql,
      searchParams: new URLSearchParams('type=image&mimeType=image%2Fjpeg&search=cover&page=1'),
    });
    expect(calls(gql.query)).toEqual([
      {
        operation: 'UploadsAdmin',
        variables: { first: 20, type: 'image', mimeType: 'image/jpeg', search: 'cover' },
      },
    ]);
  });

  it('deletes the checked uploads', async () => {
    const gql = stubGraphQL({ mutate: { removeMediaUpload: true } });
    const result = await deleteMedia({
      gql,
      formData: form({ ids: ['m1', 'm2', 'm3'] }),
      url: new URL('http://localhost/admin/media?type=audio'),
    });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'DeleteMedia', variables: { ids: ['m1', 'm2', 'm3'] } },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/media?type=audio&deleted=3' });
  });

  it('loads an upload to edit', async () => {
    const gql = stubGraphQL();
    await loadMedia({ gql, id: 'm1' });
    expect(calls(gql.query)).toEqual([{ operation: 'MediaAdmin', variables: { id: 'm1' } }]);
  });

  it('updates an upload', async () => {
    const gql = stubGraphQL();
    const result = await updateMedia({
      gql,
      id: 'm1',
      formData: form({ title: 'Cover', altText: 'An album cover', caption: '' }),
      url: new URL('http://localhost/admin/media/m1'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'UpdateMedia',
        variables: { id: 'm1', input: { title: 'Cover', altText: 'An album cover' } },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/media/m1?message=updated' });
  });
});

describe('album covers', () => {
  it('waits for a search', async () => {
    const gql = stubGraphQL();
    await expect(
      searchAlbumCovers({ gql, searchParams: new URLSearchParams('search=%20%20') })
    ).resolves.toEqual({ appleMusicAlbums: null });
    expect(gql.query).not.toHaveBeenCalled();
  });

  it('searches Apple Music for the trimmed term', async () => {
    const albums = { appleMusicAlbums: { albums: [], error: null } };
    const gql = stubGraphQL({ query: albums });
    await expect(
      searchAlbumCovers({ gql, searchParams: new URLSearchParams('search=%20Kid%20A%20') })
    ).resolves.toBe(albums);
    expect(calls(gql.query)).toEqual([
      { operation: 'AlbumCoversAdmin', variables: { term: 'Kid A' } },
    ]);
  });

  it('adds the checked covers and says how many on the media list', async () => {
    const gql = stubGraphQL({ mutate: { addAlbumCovers: [{ id: 'm9' }, { id: 'm10' }] } });
    const result = await addAlbumCovers({ gql, formData: form({ selected: ['111', '222'] }) });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'AddAlbumCovers', variables: { ids: ['111', '222'] } },
    ]);
    expect(result).toEqual({ redirectTo: '/admin/media?added=2' });
  });

  it('says so when adding fails', async () => {
    const result = await addAlbumCovers({ gql: stubGraphQL(), formData: form({ selected: '1' }) });
    expect(result).toEqual({ failed: true });
  });
});
