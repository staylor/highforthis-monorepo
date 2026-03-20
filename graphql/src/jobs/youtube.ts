import prisma from '#/database';
import { slugify } from '#/models/utils';

const API_HOST = 'https://www.googleapis.com';
const PLAYLISTS_PATH = '/youtube/v3/playlists';
const PLAYLIST_PATH = '/youtube/v3/playlistItems';
const PER_PAGE = '50';
const CHANNEL_ID = 'UCwQRSPBN5eGmO1nYE40t1hw';

const API_KEY = process.env.YOUTUBE_API_KEY || '';
if (!API_KEY) {
  throw new Error('Must set YOUTUBE_API_KEY on process.env');
}

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

  const slug = slugify(snippet.title);
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

  const video = await prisma.video.upsert({
    where: { dataId: data.dataId },
    create: { ...data, slug },
    update: data,
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

  const updates = await Promise.all(validItems.map((item) => updateVideo(item, year, playlistId)));

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
  let response: YouTubeListResponse<YouTubePlaylist>;
  try {
    response = await fetchPlaylists();
  } catch {
    console.log('Fetch playlists failed :(');
    return;
  }

  await Promise.all(
    response.items
      .filter((playlist) => /^\d{4}$/.test(playlist.snippet.title))
      .map((playlist) => fetchPlaylist(playlist.snippet.title, playlist.id))
  );
};
