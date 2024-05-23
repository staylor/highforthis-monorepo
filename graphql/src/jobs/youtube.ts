import { URL } from 'node:url';

import type { Db } from 'mongodb';
import fetch from 'node-fetch';

import { slugify } from '@/models/utils';

const API_HOST = 'https://www.googleapis.com';
const PLAYLISTS_PATH = '/youtube/v3/playlists';
const PLAYLIST_PATH = '/youtube/v3/playlistItems';
const PER_PAGE = '50';
const CHANNEL_ID = 'UCwQRSPBN5eGmO1nYE40t1hw';

const API_KEY = process.env.YOUTUBE_API_KEY || '';
if (!API_KEY) {
  throw new Error('Must set YOUTUBE_API_KEY on process.env');
}

function getPlaylistsUrl() {
  const requestURL = new URL(PLAYLISTS_PATH, API_HOST);
  requestURL.searchParams.set('maxResults', PER_PAGE);
  requestURL.searchParams.set('part', 'snippet');
  requestURL.searchParams.set('key', API_KEY);
  requestURL.searchParams.set('channelId', CHANNEL_ID);
  return requestURL.href;
}

function getPlaylistUrl(playlistId: string, pageToken?: string): string {
  const requestURL = new URL(PLAYLIST_PATH, API_HOST);
  requestURL.searchParams.set('playlistId', playlistId);
  requestURL.searchParams.set('maxResults', PER_PAGE);
  requestURL.searchParams.set('part', 'snippet,contentDetails');
  requestURL.searchParams.set('key', API_KEY);
  if (pageToken) {
    requestURL.searchParams.set('pageToken', pageToken);
  }
  return requestURL.href;
}

async function fetchPlaylists() {
  return fetch(getPlaylistsUrl()).then((response) => response.json());
}

async function fetchPlaylistItems(playlistId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    let items: any[] = [];

    const fetchPage = (pageToken?: string): void => {
      const playlistUrl = getPlaylistUrl(playlistId, pageToken);
      // console.log(playlistUrl);
      fetch(playlistUrl)
        .catch((e) => {
          if (items.length) {
            resolve(items);
          } else {
            reject(e);
          }
        })
        .then(async (response) => {
          if (response) {
            const result: any = await response.json();
            items = items.concat(result.items);
            if (result.nextPageToken) {
              fetchPage(result.nextPageToken);
            } else {
              resolve(items);
            }
          }
        });
    };

    fetchPage();
  });
}

async function updateVideo(
  db: Db,
  { contentDetails, snippet }: Record<string, any>,
  year: string,
  playlistId: string
) {
  // console.log('Update start for dataId:', contentDetails.videoId);
  // console.log('Title:', snippet.title);
  const thumbnails =
    snippet && snippet.thumbnails
      ? Object.keys(snippet.thumbnails).map((thumb) => snippet.thumbnails[thumb])
      : null;

  const date = new Date(contentDetails.videoPublishedAt);
  const data = {
    dataId: contentDetails.videoId,
    dataType: 'youtube',
    dataPlaylistId: playlistId,
    year: parseInt(year, 10),
    publishedISO: contentDetails.videoPublishedAt,
    publishedAt: date.getTime(),
    title: snippet.title,
    position: snippet.position,
    slug: slugify(snippet.title),
    updatedAt: Date.now(),
    thumbnails,
  };

  try {
    await db.collection('video').updateOne(
      { dataId: data.dataId },
      {
        $set: data,
        $setOnInsert: {
          createdAt: Date.now(),
        },
      },
      { upsert: true }
    );
    return data.dataId;
  } catch (e) {
    throw e;
  }
}

async function fetchPlaylist(db: Db, year: string, playlistId: string): Promise<string[]> {
  let items;
  try {
    items = await fetchPlaylistItems(playlistId);
  } catch (e) {
    console.log('Fetch playlist', playlistId, 'failed :(');
    return [];
  }

  const newIds = items.map((item) => item.contentDetails.videoId);
  const cursor = await db
    .collection('video')
    .find({ dataPlaylistId: playlistId }, { dataId: 1 } as any)
    .toArray();
  const existing = cursor.map(({ dataId }) => dataId);

  const updates = await Promise.all(
    items.map((item, i) => {
      // console.log('Map start:', i);
      if (
        !item ||
        item.snippet.title === 'Private video' ||
        !item.contentDetails.videoPublishedAt
      ) {
        console.log(playlistId, 'has a deletion:', item.contentDetails.videoId);
        return false;
      }
      return updateVideo(db, item, year, playlistId);
    })
  );

  // console.log('Existing length:', existing.length);
  // console.log('Updates count:', updates.length);
  const updated = updates.filter(Boolean);
  // console.log('Updated count:', updated.length);
  if (existing.length) {
    const orphans = existing.filter((id: string) => newIds.indexOf(id) < 0);
    if (orphans.length) {
      console.log('Orphans in:', playlistId, '-', orphans);
      await db.collection('video').deleteMany({
        dataId: { $in: orphans },
        dataPlaylistId: playlistId,
      });
    } else if (updated.length > existing.length) {
      console.log('Added', updated.length - existing.length, 'items to', playlistId);
    }
  } else {
    console.log('Imported', updated.length, 'of', items.length, 'items from', playlistId);
  }
  return updated;
}

export default async (db: Db) => {
  let response: any;
  try {
    response = await fetchPlaylists();
  } catch (e) {
    console.log('Fetch playlists failed :(');
    return;
  }

  await Promise.all(
    response?.items?.map((playlist: any) => {
      if (playlist.snippet.title.match(/^[0-9]{4}$/)) {
        return fetchPlaylist(db, playlist.snippet.title, playlist.id);
      }
      return Promise.resolve();
    }) || []
  );
};
