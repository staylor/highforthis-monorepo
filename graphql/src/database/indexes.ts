import type { Db } from 'mongodb';

export default async function createIndexes(db: Db) {
  const artist = db.collection('artist');
  await artist.createIndex({ name: 'text', description: 'text' }, { background: true });
  await artist.createIndex({ slug: 1 }, { background: true });
  const post = db.collection('post');
  await post.createIndex({ title: 'text', summary: 'text' }, { background: true });
  await post.createIndex({ slug: 1 }, { background: true });
  await db
    .collection('media')
    .createIndex({ title: 'text', originalName: 'text' }, { background: true });
  await db.collection('show').createIndex({ title: 'text' }, { background: true });
  await db.collection('podcast').createIndex({ title: 'text' }, { background: true });
  const venue = db.collection('venue');
  await venue.createIndex({ name: 'text', description: 'text' }, { background: true });
  await venue.createIndex({ slug: 1 }, { background: true });
  await db.collection('user').createIndex({ name: 'text', bio: 'text' }, { background: true });
  const video = db.collection('video');
  await video.createIndex({ title: 'text' }, { background: true });
  await video.createIndex({ year: -1 }, { background: true });
}
