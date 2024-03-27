import path from 'node:path';

import database from '../database';
import Media from '../models/Media';
import type { StorageAdapter } from '../uploads/adapter';
import mediaAdapter from '../uploads/adapter';

const uploadDir = path.join(process.cwd(), 'public/uploads');

interface FileData {
  destination: string;
  fileName: string;
}

(async () => {
  const { db, client } = await database();
  const media = new Media({ db });
  const adapter: StorageAdapter = mediaAdapter(uploadDir);

  const uploads: FileData[] = [];
  const items = await media.collection.find({}).toArray();
  items.forEach(item => {
    uploads.push({ destination: item.destination, fileName: item.fileName });
    if (item.type === 'image') {
      item.crops.forEach((crop: FileData) => {
        uploads.push({
          destination: item.destination,
          fileName: crop.fileName,
        });
      });
    } else if (item.type === 'audio') {
      item.images.forEach((crop: FileData) => {
        uploads.push({
          destination: item.destination,
          fileName: crop.fileName,
        });
      });
    }
  });

  console.log(`Uploading ${uploads.length} files`);
  adapter.run(uploads).then(() => {
    client.close();
    console.log('All done!');
  });
})();
