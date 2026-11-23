import { and, inList } from 'remix/data-table';
import { z } from 'zod';

import { createLogger } from '@highforthis/shared/logger';

import db from '#/database/db';
import { newId, videos, videoThumbnails } from '#/database/tables';
import env from '#/env';
import { getUniqueSlug, slugsIn } from '#/models/utils';

const API = 'https://www.googleapis.com/youtube/v3';
const PER_PAGE = '50';
const CHANNEL_ID = 'UCwQRSPBN5eGmO1nYE40t1hw';

const API_KEY = env.YOUTUBE_API_KEY ?? '';

const logger = createLogger({ serviceName: 'graphql' });

const playlistSchema = z.object({
  id: z.string(),
  snippet: z.object({ title: z.string() }),
});

const playlistItemSchema = z.object({
  snippet: z.object({
    title: z.string(),
    position: z.number(),
    thumbnails: z
      .record(
        z.string(),
        z.object({ url: z.string(), width: z.number().optional(), height: z.number().optional() })
      )
      .optional(),
  }),
  // A private or deleted video has no publish date
  contentDetails: z.object({ videoId: z.string(), videoPublishedAt: z.string().optional() }),
});

type PlaylistItem = z.infer<typeof playlistItemSchema>;
type PublishedItem = PlaylistItem & { contentDetails: { videoPublishedAt: string } };

/**
 * Every item of one of the API's lists. An answer that isn't a page of the list is an error: part
 * of a playlist would make the rest of its videos look removed.
 */
async function fetchAll<T>(
  resource: string,
  params: Record<string, string>,
  itemSchema: z.ZodType<T>
): Promise<T[]> {
  const pageSchema = z.object({
    items: z.array(itemSchema),
    nextPageToken: z.string().optional(),
  });
  const items: T[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${API}/${resource}`);
    url.search = new URLSearchParams({
      ...params,
      maxResults: PER_PAGE,
      key: API_KEY,
      ...(pageToken && { pageToken }),
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) {
      throw new Error(`YouTube returned HTTP ${response.status} for ${resource}.`);
    }
    const page = pageSchema.parse(await response.json());
    items.push(...page.items);
    pageToken = page.nextPageToken;
  } while (pageToken);

  return items;
}

const isPublished = (item: PlaylistItem): item is PublishedItem =>
  item.snippet.title !== 'Private video' && Boolean(item.contentDetails.videoPublishedAt);

async function saveVideo(
  { contentDetails, snippet }: PublishedItem,
  year: number,
  playlistId: string
) {
  const thumbnails = Object.values(snippet.thumbnails ?? {}).flatMap(({ url, width, height }) =>
    width && height ? [{ url, width, height }] : []
  );

  const data = {
    dataId: contentDetails.videoId,
    dataType: 'youtube',
    dataPlaylistId: playlistId,
    year,
    publishedISO: contentDetails.videoPublishedAt,
    publishedAt: new Date(contentDetails.videoPublishedAt),
    title: snippet.title,
    position: snippet.position,
  };

  // Two videos can have the same title, so a new video gets a unique slug. An existing video
  // keeps its slug, and with it its page's address.
  const existing = await db.findOne(videos, { where: { dataId: data.dataId } });
  const videoId = existing?.id ?? newId();
  if (existing) {
    await db.update(videos, videoId, data);
  } else {
    await db.create(videos, {
      ...data,
      id: videoId,
      slug: await getUniqueSlug(slugsIn(db, videos), snippet.title),
    });
  }

  // Replace thumbnails
  await db.deleteMany(videoThumbnails, { where: { videoId } });
  if (thumbnails.length) {
    await db.createMany(
      videoThumbnails,
      thumbnails.map((thumbnail) => ({ ...thumbnail, id: newId(), videoId }))
    );
  }

  return Boolean(existing);
}

async function importPlaylist(year: number, playlistId: string) {
  let items: PlaylistItem[];
  try {
    items = await fetchAll(
      'playlistItems',
      { part: 'snippet,contentDetails', playlistId },
      playlistItemSchema
    );
  } catch (error) {
    // Nothing is saved or removed from a playlist that didn't load in full
    logger.warn({ err: error, playlistId, year }, 'Could not load a YouTube playlist');
    return;
  }

  const existing = await db
    .query(videos)
    .where({ dataPlaylistId: playlistId })
    .select('dataId')
    .all();

  // One at a time, so two new videos with the same title can't claim the same slug
  let added = 0;
  for (const item of items.filter(isPublished)) {
    if (!(await saveVideo(item, year, playlistId))) {
      added += 1;
    }
  }

  // A video that has gone private is still in the playlist, so it isn't removed
  const listed = new Set(items.map((item) => item.contentDetails.videoId));
  const removed = existing.map(({ dataId }) => dataId).filter((dataId) => !listed.has(dataId));
  if (removed.length) {
    await db.deleteMany(videos, {
      where: and(inList('dataId', removed), { dataPlaylistId: playlistId }),
    });
  }

  if (added || removed.length) {
    logger.info({ playlistId, year, added, removed }, 'Imported a YouTube playlist');
  }
}

/** Imports the videos in the channel's playlists that are named for a year, like "2025". */
export default async () => {
  if (!API_KEY) {
    logger.info('Skipping the YouTube import: YOUTUBE_API_KEY is not set');
    return;
  }

  let playlists: z.infer<typeof playlistSchema>[];
  try {
    playlists = await fetchAll(
      'playlists',
      { part: 'snippet', channelId: CHANNEL_ID },
      playlistSchema
    );
  } catch (error) {
    logger.warn({ err: error }, "Could not list the YouTube channel's playlists");
    return;
  }

  for (const playlist of playlists) {
    if (/^\d{4}$/.test(playlist.snippet.title)) {
      await importPlaylist(Number(playlist.snippet.title), playlist.id);
    }
  }
};
