import type { Db } from 'mongodb';

export default function createIndexes(db: Db): void {
  const artist = db.collection('artist');
  artist.createIndex({ name: 'text', description: 'text' }, { background: true });
  artist.createIndex({ slug: 1 }, { background: true });
  const post = db.collection('post');
  post.createIndex({ title: 'text', summary: 'text' }, { background: true });
  post.createIndex({ slug: 1 }, { background: true });
  db.collection('media').createIndex({ title: 'text', originalName: 'text' }, { background: true });
  db.collection('show').createIndex({ title: 'text' }, { background: true });
  db.collection('podcast').createIndex({ title: 'text' }, { background: true });
  const venue = db.collection('venue');
  venue.createIndex({ name: 'text', description: 'text' }, { background: true });
  venue.createIndex({ slug: 1 }, { background: true });
  db.collection('user').createIndex({ name: 'text', bio: 'text' }, { background: true });
  const video = db.collection('video');
  video.createIndex({ title: 'text' }, { background: true });
  video.createIndex({ year: -1 }, { background: true });
}
