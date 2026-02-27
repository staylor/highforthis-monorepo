import path from 'node:path';

import prisma from '../database';
import type { StorageAdapter } from '../uploads/adapter';
import mediaAdapter from '../uploads/adapter';

const uploadDir = path.join(process.cwd(), 'public/uploads');

interface FileData {
  destination: string;
  fileName: string;
}

(async () => {
  const adapter: StorageAdapter = mediaAdapter(uploadDir);

  const uploads: FileData[] = [];
  const items = await prisma.mediaUpload.findMany({
    include: { crops: true, audioImages: true },
  });
  items.forEach((item) => {
    uploads.push({ destination: item.destination, fileName: item.fileName });
    if (item.type === 'image' && item.crops.length > 0) {
      item.crops.forEach((crop) => {
        uploads.push({
          destination: item.destination,
          fileName: crop.fileName,
        });
      });
    } else if (item.type === 'audio' && item.audioImages.length > 0) {
      item.audioImages.forEach((image) => {
        uploads.push({
          destination: item.destination,
          fileName: image.fileName,
        });
      });
    }
  });

  console.log(`Uploading ${uploads.length} files`);
  await adapter.run(uploads);
  await prisma.$disconnect();
  console.log('All done!');
})();
