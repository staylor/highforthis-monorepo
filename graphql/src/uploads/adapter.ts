import type { Bucket } from '@google-cloud/storage';
import { Storage } from '@google-cloud/storage';

import env from '#/env';

interface FileInfo {
  fileName: string;
  destination: string;
}

class StorageAdapter {
  private uploadDir: string;

  private bucket: Bucket;

  public constructor(uploadDir: string) {
    this.uploadDir = uploadDir;
    const storage = new Storage({
      credentials: {
        client_email: env.GCS_CLIENT_EMAIL,
        private_key: env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
    this.bucket = storage.bucket(env.GCS_BUCKET);
  }

  public async upload({ fileName, destination }: FileInfo): Promise<boolean> {
    const relativeFile = `${destination.replace(`${this.uploadDir}/`, '')}/${fileName}`;
    const filePath = `${this.uploadDir}/${relativeFile}`;

    await this.bucket.upload(filePath, { destination: relativeFile });
    console.log(`${relativeFile} uploaded to ${this.bucket.name}.`);
    // await this.bucket.file(relativeFile).makePublic();

    return true;
  }

  public run(files: FileInfo[]): Promise<boolean[]> {
    return Promise.all(files.map(this.upload, this));
  }
}

export { StorageAdapter };

const adapter = (uploadDir: string): StorageAdapter => new StorageAdapter(uploadDir);

export default adapter;
