import { beforeEach, describe, expect, it, vi } from 'vitest';

import importVideos from '../youtube';

const db = vi.hoisted(() => ({
  video: {
    count: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  videoThumbnail: { createMany: vi.fn(), deleteMany: vi.fn() },
}));
const logger = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }));

vi.mock('#/database', () => ({ default: db }));
vi.mock('@highforthis/shared/logger', () => ({ createLogger: () => logger }));

const item = (videoId: string, title: string, position: number) => ({
  snippet: {
    title,
    position,
    thumbnails: {
      default: { url: `https://i.ytimg.com/vi/${videoId}/default.jpg`, width: 120, height: 90 },
    },
  },
  contentDetails: { videoId, videoPublishedAt: '2025-06-01T12:00:00Z' },
});

const privateItem = (videoId: string) => ({
  snippet: { title: 'Private video', position: 9, thumbnails: {} },
  contentDetails: { videoId },
});

const playlists = { items: [{ id: 'playlist-2025', snippet: { title: '2025' } }] };

/** Answers each request to the YouTube API from `answer`, by resource and page */
function stubYouTube(answer: (resource: string, pageToken: string | null) => Response) {
  const requests: URL[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: URL | string) => {
      const url = new URL(input);
      requests.push(url);
      return answer(url.pathname.split('/').pop() ?? '', url.searchParams.get('pageToken'));
    })
  );
  return requests;
}

describe('the YouTube import', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // The playlist's videos as they were last imported
    db.video.findMany.mockResolvedValue([{ dataId: 'kept' }, { dataId: 'removed' }]);
    db.video.findUnique.mockImplementation(async ({ where }) =>
      where.dataId === 'kept' ? { id: 'video-kept' } : null
    );
    db.video.count.mockResolvedValue(0);
    db.video.update.mockResolvedValue({ id: 'video-kept' });
    db.video.create.mockResolvedValue({ id: 'video-new' });
  });

  it('adds new videos, updates the ones it has and removes the ones no longer listed', async () => {
    const requests = stubYouTube((resource) =>
      Response.json(
        resource === 'playlists'
          ? playlists
          : { items: [item('kept', 'Kept (Night 1)', 0), item('new', 'New (Night 2)', 1)] }
      )
    );

    await importVideos();

    expect(requests.map((url) => url.pathname)).toEqual([
      '/youtube/v3/playlists',
      '/youtube/v3/playlistItems',
    ]);
    expect(db.video.update).toHaveBeenCalledWith({
      where: { id: 'video-kept' },
      data: expect.objectContaining({ dataId: 'kept', title: 'Kept (Night 1)', year: 2025 }),
    });
    expect(db.video.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dataId: 'new',
        dataPlaylistId: 'playlist-2025',
        position: 1,
        publishedAt: new Date('2025-06-01T12:00:00Z'),
        slug: 'new-night-2',
      }),
    });
    expect(db.videoThumbnail.createMany).toHaveBeenCalledTimes(2);
    expect(db.video.deleteMany).toHaveBeenCalledWith({
      where: { dataId: { in: ['removed'] }, dataPlaylistId: 'playlist-2025' },
    });
  });

  it('reads every page of a playlist', async () => {
    stubYouTube((resource, pageToken) => {
      if (resource === 'playlists') return Response.json(playlists);
      return Response.json(
        pageToken
          ? { items: [item('removed', 'Second page', 50)] }
          : { items: [item('kept', 'First page', 0)], nextPageToken: 'page-2' }
      );
    });

    await importVideos();

    expect(db.video.deleteMany).not.toHaveBeenCalled();
  });

  it('keeps a video that has gone private, without updating it', async () => {
    stubYouTube((resource) =>
      Response.json(
        resource === 'playlists'
          ? playlists
          : { items: [item('kept', 'Kept', 0), privateItem('removed')] }
      )
    );

    await importVideos();

    expect(db.video.update).toHaveBeenCalledTimes(1);
    expect(db.video.create).not.toHaveBeenCalled();
    expect(db.video.deleteMany).not.toHaveBeenCalled();
  });

  // Each of these answers used to look like a playlist that had lost its videos, which deleted
  // them, and with them the posts' links to them
  it.each([
    [
      'an error',
      () => Response.json({ error: { code: 403, message: 'quotaExceeded' } }, { status: 403 }),
    ],
    ['an error with a successful status', () => Response.json({ error: { code: 500 } })],
    ['something other than JSON', () => new Response('<html>Bad Gateway</html>', { status: 502 })],
  ])('changes nothing in a playlist that YouTube answers with %s', async (_, failure) => {
    stubYouTube((resource) => (resource === 'playlists' ? Response.json(playlists) : failure()));

    await importVideos();

    expect(db.video.deleteMany).not.toHaveBeenCalled();
    expect(db.video.update).not.toHaveBeenCalled();
    expect(db.video.create).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ playlistId: 'playlist-2025' }),
      expect.any(String)
    );
  });

  it('changes nothing in a playlist when one of its pages fails', async () => {
    stubYouTube((resource, pageToken) => {
      if (resource === 'playlists') return Response.json(playlists);
      return pageToken
        ? new Response(null, { status: 500 })
        : Response.json({ items: [item('kept', 'First page', 0)], nextPageToken: 'page-2' });
    });

    await importVideos();

    expect(db.video.deleteMany).not.toHaveBeenCalled();
    expect(db.video.update).not.toHaveBeenCalled();
  });

  it('gives up quietly when the playlists cannot be listed', async () => {
    stubYouTube(() => {
      throw new TypeError('fetch failed');
    });

    await expect(importVideos()).resolves.toBeUndefined();
    expect(db.video.findMany).not.toHaveBeenCalled();
  });
});
