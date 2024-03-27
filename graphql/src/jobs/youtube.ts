import { URL } from 'node:url';

import type { Db } from 'mongodb';
import fetch from 'node-fetch';

import { slugify } from '@/models/utils';

const API_HOST = 'https://www.googleapis.com';
const API_PATH = '/youtube/v3/playlistItems';
const PER_PAGE = '50';

interface PlainObj {
  [key: string]: any;
}

const PLAYLISTS: PlainObj = {
  2011: 'PLzPoW8nNb67yHiQ4kJMDA9yK8Z0rqY9Cb',
  2013: 'PLzPoW8nNb67yg4XZNav7DPtvM10jtJ2ZV',
  2014: 'PLzPoW8nNb67yZ7pyqjBp3k2bVq3GNcprV',
  2015: 'PLzPoW8nNb67xsdCAuUSXvN5d32UFi-XDb',
  2017: 'PLzPoW8nNb67zZTUAlJA4BO3Cakt_9uGQU',
  2018: 'PLzPoW8nNb67z5cB4_sqSS1PyY_410J9Dk',
  2019: 'PLzPoW8nNb67yZaz-GnivBv7V-YbTaBYrZ',
  2021: 'PLzPoW8nNb67xzHhC8TggYu9EaCrYlx8vf',
  2022: 'PLzPoW8nNb67w0UhTZzz6oOw42DeBTza1Z',
  2023: 'PLzPoW8nNb67w28DFc1uxdAoCm9T_5vDNa',
  2024: 'PLzPoW8nNb67zqJBL72xDCfxVG1AvA_JUH',
};

function getPlaylistUrl(playlistId: string, pageToken?: string): string {
  const requestURL = new URL(API_PATH, API_HOST);
  requestURL.searchParams.set('playlistId', playlistId);
  requestURL.searchParams.set('maxResults', PER_PAGE);
  requestURL.searchParams.set('part', 'snippet,contentDetails');
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('Must set YOUTUBE_API_KEY on process.env');
  }
  requestURL.searchParams.set('key', process.env.YOUTUBE_API_KEY);
  if (pageToken) {
    requestURL.searchParams.set('pageToken', pageToken);
  }
  return requestURL.href;
}

async function fetchPlaylistItems(playlistId: string): Promise<PlainObj[]> {
  return new Promise((resolve, reject) => {
    let items: PlainObj[] = [];

    const fetchPage = (pageToken?: string): void => {
      const playlistUrl = getPlaylistUrl(playlistId, pageToken);
      // console.log(playlistUrl);
      fetch(playlistUrl)
        .catch(e => {
          if (items.length) {
            resolve(items);
          } else {
            reject(e);
          }
        })
        .then((response: any) => response.json())
        .then((result: PlainObj) => {
          items = items.concat(result.items);
          if (result.nextPageToken) {
            fetchPage(result.nextPageToken);
          } else {
            resolve(items);
          }
        });
    };

    fetchPage();
  });
}

async function updateVideo(
  db: Db,
  { contentDetails, snippet }: PlainObj,
  year: string,
  playlistId: string
) {
  const thumbnails =
    snippet && snippet.thumbnails
      ? Object.keys(snippet.thumbnails).map(thumb => snippet.thumbnails[thumb])
      : null;

  const date = new Date(contentDetails.videoPublishedAt);
  const data = {
    dataId: contentDetails.videoId,
    dataType: 'youtube',
    dataPlaylistIds: [playlistId],
    year: parseInt(year, 10),
    publishedISO: contentDetails.videoPublishedAt,
    publishedAt: date.getTime(),
    title: snippet.title,
    position: snippet.position,
    slug: slugify(snippet.title),
    updatedAt: Date.now(),
    thumbnails,
  };

  if (!data.publishedISO || data.title === 'Private video') {
    return Promise.resolve('');
  }

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
  const items = await fetchPlaylistItems(playlistId);
  const cursor = db.collection('video').find({ dataPlaylistIds: playlistId }, { dataId: 1 } as any);
  return cursor
    .toArray()
    .then((ids: PlainObj[]) => ids.map(({ dataId }) => dataId))
    .then((ids: string[]) =>
      Promise.all(
        items.map(item => {
          if (
            !item ||
            item.snippet.title === 'Private video' ||
            !item.contentDetails.videoPublishedAt
          ) {
            return Promise.resolve('');
          }
          return updateVideo(db, item, year, playlistId);
        })
      ).then((results: any[]) => {
        const dataIds = results.filter(Boolean);
        if (ids.length) {
          const orphans = ids.filter((id: string) => dataIds.indexOf(id) < 0);
          if (orphans.length) {
            console.log('Orphans in:', playlistId, '-', orphans);
            db.collection('video').deleteMany({
              dataId: { $in: orphans },
              playlistIds: playlistId,
            });
          } else if (dataIds.length > ids.length) {
            console.log('Added', dataIds.length - ids.length, 'items to', playlistId);
          }
        } else {
          console.log('Imported', items.length, 'items from', playlistId);
        }
        return dataIds;
      })
    );
}

export default async (db: Db) =>
  Promise.all(
    Object.entries(PLAYLISTS).map(([year, playlistId]) => fetchPlaylist(db, year, playlistId))
  );
