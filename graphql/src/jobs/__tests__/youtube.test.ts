import { getTableColumns, getTableName } from 'remix/data-table';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import db from '#/database/db';
import { videos, videoThumbnails } from '#/database/tables';

import importVideos from '../youtube';

vi.mock('#/database/db', async () => {
  const { createSqliteDatabase } = await import('remix/data-table/sqlite');
  return { default: createSqliteDatabase({ filename: ':memory:' }) };
});

const logger = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }));
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

const playlist = (year: string) => ({ id: `playlist-${year}`, snippet: { title: year } });
const playlists = { items: [playlist('2025')] };

/** Answers each request to the YouTube API from fixtures. */
function stubYouTube(
  answer: (resource: string, pageToken: string | null, list: string | null) => Response
) {
  const requests: URL[] = [];
  vi.stubGlobal('fetch', async (input: URL | string) => {
    const url = new URL(input);
    requests.push(url);
    return answer(
      url.pathname.split('/').pop() ?? '',
      url.searchParams.get('pageToken'),
      url.searchParams.get('playlistId')
    );
  });
  return requests;
}

describe('the YouTube import', () => {
  beforeAll(async () => {
    for (const table of [videos, videoThumbnails]) {
      const columns = Object.keys(getTableColumns(table)).map((name) => `"${name}"`);
      await db.exec(`create table "${getTableName(table)}" (${columns}, primary key ("id"))`);
    }
    await db.exec('create unique index video_data_id on "Video" ("dataId")');
    await db.exec('create unique index video_slug on "Video" ("slug")');
    // A failed thumbnail write after the previous thumbnails were removed.
    await db.exec(`create trigger refuse_thumbnail before insert on "VideoThumbnail"
      when new.width = -1 begin select raise(abort, 'refused thumbnail'); end`);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await db.exec('delete from "VideoThumbnail"');
    await db.exec('delete from "Video"');
    for (const dataId of ['kept', 'removed']) {
      await db.create(videos, {
        id: `video-${dataId}`,
        dataId,
        slug: `original-${dataId}`,
        dataType: 'youtube',
        dataPlaylistId: 'playlist-2025',
        year: 2025,
        position: 0,
        publishedISO: '2025-06-01T12:00:00Z',
        publishedAt: new Date('2025-06-01T12:00:00Z'),
        title: dataId,
      });
    }
    await db.create(videoThumbnails, {
      id: 'old-thumbnail',
      videoId: 'video-kept',
      width: 120,
      height: 90,
      url: 'old.jpg',
    });
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    await db.close();
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
    await expect(db.find(videos, 'video-kept')).resolves.toMatchObject({
      title: 'Kept (Night 1)',
      slug: 'original-kept',
    });
    const added = await db.findOne(videos, { where: { dataId: 'new' } });
    expect(added).toMatchObject({
      dataPlaylistId: 'playlist-2025',
      position: 1,
      year: 2025,
      slug: 'new-night-2',
    });
    await expect(
      db.findMany(videoThumbnails, { where: { videoId: added!.id } })
    ).resolves.toMatchObject([{ width: 120, height: 90 }]);
    await expect(db.find(videoThumbnails, 'old-thumbnail')).resolves.toBeNull();
    await expect(db.find(videos, 'video-removed')).resolves.toBeNull();
  });

  it.each([
    ['2025', '2026'],
    ['2026', '2025'],
  ])('keeps a moved video when reading %s then %s', async (a, b) => {
    stubYouTube((resource, _, list) =>
      Response.json(
        resource === 'playlists'
          ? { items: [playlist(a), playlist(b)] }
          : { items: list === 'playlist-2026' ? [item('kept', 'Moved', 0)] : [] }
      )
    );

    await importVideos();

    await expect(db.find(videos, 'video-kept')).resolves.toMatchObject({
      slug: 'original-kept',
      year: 2026,
      dataPlaylistId: 'playlist-2026',
    });
    await expect(db.find(videos, 'video-removed')).resolves.toBeNull();
  });

  it('defers removals when a possible destination playlist failed to load', async () => {
    stubYouTube((resource, _, list) => {
      if (resource === 'playlists')
        return Response.json({ items: [playlist('2025'), playlist('2026')] });
      return list === 'playlist-2026'
        ? new Response(null, { status: 503 })
        : Response.json({ items: [item('kept', 'Updated', 0)] });
    });

    await importVideos();

    await expect(db.find(videos, 'video-kept')).resolves.toMatchObject({ title: 'Updated' });
    await expect(db.find(videos, 'video-removed')).resolves.toMatchObject({
      slug: 'original-removed',
    });
  });

  it('rolls back the video and its thumbnails when replacement thumbnails cannot be saved', async () => {
    const changed = item('kept', 'Renamed', 0);
    changed.snippet.thumbnails.default.width = -1;
    stubYouTube((resource) =>
      Response.json(resource === 'playlists' ? playlists : { items: [changed] })
    );

    await expect(importVideos()).rejects.toThrow('Database execution failed');

    await expect(db.find(videos, 'video-kept')).resolves.toMatchObject({ title: 'kept' });
    await expect(db.find(videoThumbnails, 'old-thumbnail')).resolves.toMatchObject({
      url: 'old.jpg',
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

    await expect(db.find(videos, 'video-removed')).resolves.toMatchObject({ title: 'Second page' });
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

    await expect(db.find(videos, 'video-removed')).resolves.toMatchObject({ title: 'removed' });
  });

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

    await expect(db.count(videos)).resolves.toBe(2);
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

    await expect(db.count(videos)).resolves.toBe(2);
    await expect(db.find(videos, 'video-kept')).resolves.toMatchObject({ title: 'kept' });
  });

  it('gives up quietly when the playlists cannot be listed', async () => {
    stubYouTube(() => {
      throw new TypeError('fetch failed');
    });

    await expect(importVideos()).resolves.toBeUndefined();
    await expect(db.count(videos)).resolves.toBe(2);
  });
});
