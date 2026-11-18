import prisma from '#/database';
import env from '#/env';
import { getUniqueSlug } from '#/models/utils';

const API_HOST = 'https://www.googleapis.com';
const PLAYLISTS_PATH = '/youtube/v3/playlists';
const PLAYLIST_PATH = '/youtube/v3/playlistItems';
const PER_PAGE = '50';
const CHANNEL_ID = 'UCwQRSPBN5eGmO1nYE40t1hw';

const API_KEY = env.YOUTUBE_API_KEY ?? '';

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeSnippet {
  title: string;
  position: number;
  thumbnails?: Record<string, YouTubeThumbnail>;
}

interface YouTubeContentDetails {
  videoId: string;
  videoPublishedAt: string;
}

interface YouTubePlaylistItem {
  snippet: YouTubeSnippet;
  contentDetails: YouTubeContentDetails;
}

interface YouTubePlaylist {
  id: string;
  snippet: { title: string };
}

interface YouTubeListResponse<T> {
  items: T[];
  nextPageToken?: string;
}

function buildUrl(path: string, params: Record<string, string>) {
  const url = new URL(path, API_HOST);
  url.searchParams.set('maxResults', PER_PAGE);
  url.searchParams.set('key', API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.href;
}

function getPlaylistsUrl() {
  return buildUrl(PLAYLISTS_PATH, { part: 'snippet', channelId: CHANNEL_ID });
}

function getPlaylistUrl(playlistId: string, pageToken?: string) {
  const params: Record<string, string> = {
    part: 'snippet,contentDetails',
    playlistId,
  };
  if (pageToken) {
    params.pageToken = pageToken;
  }
  return buildUrl(PLAYLIST_PATH, params);
}

async function fetchPlaylists(): Promise<YouTubeListResponse<YouTubePlaylist>> {
  const response = await fetch(getPlaylistsUrl());
  return response.json();
}

async function fetchPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
  let items: YouTubePlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const playlistUrl = getPlaylistUrl(playlistId, pageToken);
    try {
      const response = await fetch(playlistUrl);
      const result: YouTubeListResponse<YouTubePlaylistItem> = await response.json();
      items = items.concat(result.items);
      pageToken = result.nextPageToken;
    } catch (e) {
      if (items.length) {
        return items;
      }
      throw e;
    }
  } while (pageToken);

  return items;
}

async function updateVideo(
  { contentDetails, snippet }: YouTubePlaylistItem,
  year: string,
  playlistId: string
) {
  const thumbnails = snippet.thumbnails
    ? Object.values(snippet.thumbnails).map(({ url, width, height }) => ({
        url,
        width,
        height,
      }))
    : [];

  const data = {
    dataId: contentDetails.videoId,
    dataType: 'youtube',
    dataPlaylistId: playlistId,
    year: parseInt(year, 10),
    publishedISO: contentDetails.videoPublishedAt,
    publishedAt: new Date(contentDetails.videoPublishedAt),
    title: snippet.title,
    position: snippet.position,
  };

  // Titles can share a slug ("Night 1" and "Night 2" both lose their digits), so a new
  // video gets a unique one; an existing video keeps its slug.
  const existing = await prisma.video.findUnique({
    where: { dataId: data.dataId },
    select: { id: true },
  });
  const video = existing
    ? await prisma.video.update({ where: { id: existing.id }, data })
    : await prisma.video.create({
        data: { ...data, slug: await getUniqueSlug(prisma.video, snippet.title) },
      });

  // Replace thumbnails
  await prisma.videoThumbnail.deleteMany({ where: { videoId: video.id } });
  if (thumbnails.length) {
    await prisma.videoThumbnail.createMany({
      data: thumbnails.map((t) => ({ ...t, videoId: video.id })),
    });
  }

  return data.dataId;
}

async function fetchPlaylist(year: string, playlistId: string): Promise<string[]> {
  let items: YouTubePlaylistItem[];
  try {
    items = await fetchPlaylistItems(playlistId);
  } catch {
    console.log('Fetch playlist', playlistId, 'failed :(');
    return [];
  }

  const validItems = items.filter(
    (item) => item?.snippet.title !== 'Private video' && item?.contentDetails.videoPublishedAt
  );
  const invalidCount = items.length - validItems.length;
  if (invalidCount > 0) {
    console.log(playlistId, 'has', invalidCount, 'private/unpublished videos');
  }

  const newIds = new Set(items.filter(Boolean).map((item) => item.contentDetails.videoId));
  const existing = await prisma.video.findMany({
    where: { dataPlaylistId: playlistId },
    select: { dataId: true },
  });
  const existingIds = existing.map(({ dataId }) => dataId);

  // One at a time, so two new videos with the same title can't claim the same slug
  const updates: string[] = [];
  for (const item of validItems) {
    updates.push(await updateVideo(item, year, playlistId));
  }

  if (existingIds.length) {
    const orphans = existingIds.filter((id) => !newIds.has(id));
    if (orphans.length) {
      console.log('Orphans in:', playlistId, '-', orphans);
      await prisma.video.deleteMany({
        where: {
          dataId: { in: orphans },
          dataPlaylistId: playlistId,
        },
      });
    } else if (updates.length > existingIds.length) {
      console.log('Added', updates.length - existingIds.length, 'items to', playlistId);
    }
  } else {
    console.log('Imported', updates.length, 'of', items.length, 'items from', playlistId);
  }
  return updates;
}

export default async () => {
  if (!API_KEY) {
    console.log('Skipping the YouTube import: YOUTUBE_API_KEY is not set.');
    return;
  }

  let response: YouTubeListResponse<YouTubePlaylist>;
  try {
    response = await fetchPlaylists();
  } catch {
    console.log('Fetch playlists failed :(');
    return;
  }

  for (const playlist of response.items) {
    if (/^\d{4}$/.test(playlist.snippet.title)) {
      await fetchPlaylist(playlist.snippet.title, playlist.id);
    }
  }
};
