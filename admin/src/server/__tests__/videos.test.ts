// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { loadMediaModal, loadVideoModal } from '../modals';
import { deleteVideos, loadVideo, loadVideos, updateVideo } from '../videos';

import { calls, form, stubGraphQL } from './helpers';

describe('videos', () => {
  it('loads a page of videos, filtered by year', async () => {
    const gql = stubGraphQL();
    await loadVideos({ gql, searchParams: new URLSearchParams('year=2019&search=live') });
    expect(calls(gql.query)).toEqual([
      { operation: 'VideosAdmin', variables: { first: 20, search: 'live', year: 2019 } },
    ]);
  });

  it('deletes the checked videos', async () => {
    const gql = stubGraphQL();
    await deleteVideos({
      gql,
      formData: form({ ids: 'y1' }),
      url: new URL('http://localhost/admin/video'),
    });
    expect(calls(gql.mutate)).toEqual([{ operation: 'DeleteVideo', variables: { ids: ['y1'] } }]);
  });

  it('loads and updates a video', async () => {
    const gql = stubGraphQL({ mutate: { updateVideo: { id: 'y1' } } });
    await loadVideo({ gql, id: 'y1' });
    const result = await updateVideo({
      gql,
      id: 'y1',
      formData: form({ title: 'Live at the Fillmore' }),
      url: new URL('http://localhost/admin/video/y1'),
    });
    expect(calls(gql.query)).toEqual([{ operation: 'VideoEdit', variables: { id: 'y1' } }]);
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'UpdateVideo',
        variables: { id: 'y1', input: { title: 'Live at the Fillmore' } },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/video/y1?message=updated' });
  });
});

describe('modals', () => {
  it('pages through media of one type', async () => {
    const gql = stubGraphQL();
    await loadMediaModal({ gql, type: 'image' });
    await loadMediaModal({ gql, type: 'audio', cursor: 'abc' });
    expect(calls(gql.query)).toEqual([
      { operation: 'MediaModal', variables: { first: 50, type: 'image' } },
      { operation: 'MediaModal', variables: { first: 50, type: 'audio', cursor: 'abc' } },
    ]);
  });

  it('pages through videos', async () => {
    const gql = stubGraphQL();
    await loadVideoModal({ gql });
    await loadVideoModal({ gql, cursor: 'abc' });
    expect(calls(gql.query)).toEqual([
      { operation: 'VideoModal', variables: { first: 50 } },
      { operation: 'VideoModal', variables: { first: 50, cursor: 'abc' } },
    ]);
  });
});
