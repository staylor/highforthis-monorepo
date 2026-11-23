import { and, inList } from 'remix/data-table';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { videos, videoThumbnails } from '#/database/tables';

import importVideos from '../youtube';

// The query for a playlist's videos, whose steps each answer the query
const { db, playlistQuery } = vi.hoisted(() => ({
  db: {
    count: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findOne: vi.fn(),
    query: vi.fn(),
    update: vi.fn(),
  },
  playlistQuery: { all: vi.fn(), select: vi.fn(), where: vi.fn() },
}));
const logger = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }));

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('#/database/tables', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/database/tables')>()),
  newId: () => 'video-new',
}));
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
    db.query.mockReturnValue(playlistQuery);
    playlistQuery.where.mockReturnValue(playlistQuery);
    playlistQuery.select.mockReturnValue(playlistQuery);
    playlistQuery.all.mockResolvedValue([{ dataId: 'kept' }, { dataId: 'removed' }]);
    db.findOne.mockImplementation(async (_table, { where }) =>
      where.dataId === 'kept' ? { id: 'video-kept' } : null
    );
    db.count.mockResolvedValue(0);
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
    expect(db.update).toHaveBeenCalledWith(
      videos,
      'video-kept',
      expect.objectContaining({ dataId: 'kept', title: 'Kept (Night 1)', year: 2025 })
    );
    expect(db.create).toHaveBeenCalledWith(
      videos,
      expect.objectContaining({
        id: 'video-new',
        dataId: 'new',
        dataPlaylistId: 'playlist-2025',
        position: 1,
        publishedAt: new Date('2025-06-01T12:00:00Z'),
        slug: 'new-night-2',
      })
    );
    expect(db.createMany).toHaveBeenCalledTimes(2);
    expect(db.createMany).toHaveBeenCalledWith(videoThumbnails, [
      expect.objectContaining({ videoId: 'video-new', width: 120, height: 90 }),
    ]);
    expect(db.deleteMany).toHaveBeenCalledWith(videos, {
      where: and(inList('dataId', ['removed']), { dataPlaylistId: 'playlist-2025' }),
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

    expect(db.deleteMany).not.toHaveBeenCalledWith(videos, expect.anything());
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

    expect(db.update).toHaveBeenCalledTimes(1);
    expect(db.create).not.toHaveBeenCalled();
    expect(db.deleteMany).not.toHaveBeenCalledWith(videos, expect.anything());
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

    expect(db.deleteMany).not.toHaveBeenCalledWith(videos, expect.anything());
    expect(db.update).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
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

    expect(db.deleteMany).not.toHaveBeenCalledWith(videos, expect.anything());
    expect(db.update).not.toHaveBeenCalled();
  });

  it('gives up quietly when the playlists cannot be listed', async () => {
    stubYouTube(() => {
      throw new TypeError('fetch failed');
    });

    await expect(importVideos()).resolves.toBeUndefined();
    expect(db.query).not.toHaveBeenCalled();
  });
});
