import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import { Storage } from '@google-cloud/storage';

const BUCKET = process.env.GCS_BUCKET;
const LOCAL_DIR = path.resolve('build/client');
const REMOTE_PREFIX = 'highforthis';
const CACHE_CONTROL = 'public, max-age=259200';

if (!BUCKET) {
  console.error('ERROR: GCS_BUCKET is not set');
  process.exit(1);
}

const storage = new Storage({
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});
const bucket = storage.bucket(BUCKET);

async function getLocalFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getLocalFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function upload() {
  const localFiles = await getLocalFiles(LOCAL_DIR);

  // Get existing remote files for sync comparison
  const [remoteFiles] = await bucket.getFiles({ prefix: REMOTE_PREFIX });
  const remoteMap = new Map<string, string>();
  for (const file of remoteFiles) {
    const md5 = file.metadata.md5Hash;
    if (md5) {
      remoteMap.set(file.name, md5);
    }
  }

  let uploaded = 0;
  let skipped = 0;

  await Promise.all(
    localFiles.map(async (localPath) => {
      const relativePath = path.relative(LOCAL_DIR, localPath);
      const destination = `${REMOTE_PREFIX}/${relativePath}`;

      // Check if file already exists with same size
      const localStat = await stat(localPath);
      const remoteFile = remoteFiles.find((f) => f.name === destination);
      if (remoteFile && Number(remoteFile.metadata.size) === localStat.size) {
        skipped++;
        return;
      }

      await bucket.upload(localPath, {
        destination,
        metadata: {
          cacheControl: CACHE_CONTROL,
        },
      });
      uploaded++;
      console.log(`Uploaded: ${relativePath}`);
    })
  );

  // Delete remote files that no longer exist locally
  const localSet = new Set(
    localFiles.map((f) => `${REMOTE_PREFIX}/${path.relative(LOCAL_DIR, f)}`)
  );
  let deleted = 0;
  for (const remoteFile of remoteFiles) {
    if (!localSet.has(remoteFile.name)) {
      await remoteFile.delete();
      deleted++;
      console.log(`Deleted: ${remoteFile.name}`);
    }
  }

  console.log(`\nDone! ${uploaded} uploaded, ${skipped} skipped, ${deleted} deleted.`);
}

upload().catch((err) => {
  console.error(err);
  process.exit(1);
});
