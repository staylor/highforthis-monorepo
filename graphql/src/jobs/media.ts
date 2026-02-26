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
  const items = await prisma.mediaUpload.findMany();
  items.forEach((item) => {
    uploads.push({ destination: item.destination, fileName: item.fileName });
    if (item.type === 'image' && Array.isArray(item.crops)) {
      (item.crops as any[]).forEach((crop: FileData) => {
        uploads.push({
          destination: item.destination,
          fileName: crop.fileName,
        });
      });
    } else if (item.type === 'audio' && Array.isArray(item.images)) {
      (item.images as any[]).forEach((image: FileData) => {
        uploads.push({
          destination: item.destination,
          fileName: image.fileName,
        });
      });
    }
  });

  console.log(`Uploading ${uploads.length} files`);
  adapter.run(uploads).then(async () => {
    await prisma.$disconnect();
    console.log('All done!');
  });
})();
