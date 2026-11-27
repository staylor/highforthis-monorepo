import { and, inList } from 'remix/data-table';
import { z } from 'zod';

import { createLogger } from '@highforthis/shared/logger';

import db from '#/database/db';
import { newId, videos, videoThumbnailRows, videoThumbnails } from '#/database/tables';
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

type Thumbnail = { url: string; width: number; height: number };

type VideoDetails = {
  dataId: string;
  dataType: string;
  dataPlaylistId: string;
  year: number;
  publishedISO: string;
  publishedAt: Date;
  title: string;
  position: number;
};

/** A saved video, as the import compares it with what YouTube lists */
type KnownVideo = VideoDetails & { id: string; thumbnails: Thumbnail[] };

/** Every saved video with its thumbnails, by its YouTube ID */
async function knownVideos(): Promise<Map<string, KnownVideo>> {
  const rows = await db.query(videos).with({ thumbnails: videoThumbnailRows }).all();
  return new Map(rows.map((row) => [row.dataId, row]));
}

/** Whether YouTube lists any of a video's details differently from how they're saved */
const detailsChanged = (saved: VideoDetails, listed: VideoDetails) =>
  new Date(saved.publishedAt).getTime() !== listed.publishedAt.getTime() ||
  (['dataType', 'dataPlaylistId', 'year', 'publishedISO', 'title', 'position'] as const).some(
    (key) => saved[key] !== listed[key]
  );

const thumbnailKeys = (thumbnails: Thumbnail[]) =>
  thumbnails
    .map(({ url, width, height }) => `${width}x${height} ${url}`)
    .sort()
    .join('\n');

/**
 * Saves a video from a playlist, and answers whether it's new. Only what changed is written: the
 * import runs every few hours, and most of the time YouTube lists every video as it did before.
 */
async function saveVideo(
  { contentDetails, snippet }: PublishedItem,
  year: number,
  playlistId: string,
  known: Map<string, KnownVideo>
) {
  const thumbnails = Object.values(snippet.thumbnails ?? {}).flatMap(({ url, width, height }) =>
    width && height ? [{ url, width, height }] : []
  );

  const data: VideoDetails = {
    dataId: contentDetails.videoId,
    dataType: 'youtube',
    dataPlaylistId: playlistId,
    year,
    publishedISO: contentDetails.videoPublishedAt,
    publishedAt: new Date(contentDetails.videoPublishedAt),
    title: snippet.title,
    position: snippet.position,
  };

  const existing = known.get(data.dataId);
  const changed = !existing || detailsChanged(existing, data);
  const newThumbnails =
    !existing || thumbnailKeys(existing.thumbnails) !== thumbnailKeys(thumbnails);
  if (!changed && !newThumbnails) {
    return false;
  }

  // Two videos can have the same title, so a new video gets a unique slug. An existing video
  // keeps its slug, and with it its page's address.
  const videoId = existing?.id ?? newId();
  await db.transaction(async (tx) => {
    if (!existing) {
      await tx.create(videos, {
        ...data,
        id: videoId,
        slug: await getUniqueSlug(slugsIn(tx, videos), snippet.title),
      });
    } else if (changed) {
      await tx.update(videos, videoId, data);
    }

    if (newThumbnails) {
      await tx.deleteMany(videoThumbnails, { where: { videoId } });
      if (thumbnails.length) {
        await tx.createMany(
          videoThumbnails,
          thumbnails.map((thumbnail) => ({ ...thumbnail, id: newId(), videoId }))
        );
      }
    }
  });

  // A video listed in another playlist too is compared with what was just saved
  known.set(data.dataId, { ...data, id: videoId, thumbnails });
  return !existing;
}

async function importPlaylist(year: number, playlistId: string, known: Map<string, KnownVideo>) {
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

  // One at a time, so two new videos with the same title can't claim the same slug
  let added = 0;
  for (const item of items.filter(isPublished)) {
    if (await saveVideo(item, year, playlistId, known)) {
      added += 1;
    }
  }

  if (added) {
    logger.info({ playlistId, year, added }, 'Added videos from a YouTube playlist');
  }
  // Private videos still belong to their playlists.
  return items.map((item) => item.contentDetails.videoId);
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

  const yearly = playlists.filter((playlist) => /^\d{4}$/.test(playlist.snippet.title));
  if (!yearly.length) return;
  // Read once, rather than a video at a time: there are hundreds
  const known = await knownVideos();
  const yearlyIds = new Set(yearly.map(({ id }) => id));
  const existing = [...known.values()]
    .filter(({ dataPlaylistId }) => yearlyIds.has(dataPlaylistId))
    .map(({ id, dataId, dataPlaylistId }) => ({ id, dataId, dataPlaylistId }));

  const listed = new Set<string>();
  let complete = true;
  for (const playlist of yearly) {
    const ids = await importPlaylist(Number(playlist.snippet.title), playlist.id, known);
    if (ids) {
      for (const id of ids) listed.add(id);
    } else {
      complete = false;
    }
  }

  // A video missing from one year may have moved to another. Removing it before seeing the
  // destination loses its ID, which posts use for embeds, and its slug.
  if (!complete) return;
  const removed = existing.filter(({ dataId }) => !listed.has(dataId));
  for (const [playlistId, rows] of Map.groupBy(removed, (row) => row.dataPlaylistId)) {
    const { affectedRows } = await db.deleteMany(videos, {
      where: and(
        inList(
          'id',
          rows.map(({ id }) => id)
        ),
        { dataPlaylistId: playlistId }
      ),
    });
    if (affectedRows) {
      logger.info({ playlistId, removed: affectedRows }, 'Removed videos from a YouTube playlist');
    }
  }
};
