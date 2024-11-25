import database from '../src/database';
import youtube from '../src/jobs/youtube';
import Video from '../src/models/Video';

const { db } = await database();
const model = new Video({ db });
const videos = await model.all({ limit: 1000 });

for (const video of videos) {
  if (!('dataPlaylistIds' in video)) {
    continue;
  }
  const id = String(video._id);
  await model.updateById(id, {
    dataPlaylistId: video.dataPlaylistIds[0],
  });
}
await model.collection.updateMany({}, { $unset: { dataPlaylistIds: 1 } });

await youtube(db);

process.exit(0);
