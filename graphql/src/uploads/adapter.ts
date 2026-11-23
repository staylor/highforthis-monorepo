import type { Bucket } from '@google-cloud/storage';

import { createLogger } from '@highforthis/shared/logger';

import env from '#/env';

const logger = createLogger({ serviceName: 'graphql' });

interface FileInfo {
  fileName: string;
  destination: string;
}

class StorageAdapter {
  private uploadDir: string;

  private bucket?: Promise<Bucket>;

  public constructor(uploadDir: string) {
    this.uploadDir = uploadDir;
  }

  // Imported on first use: the client adds about 5 MB of heap to every idle process.
  private getBucket(): Promise<Bucket> {
    const { GCS_BUCKET, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY } = env;
    if (!GCS_BUCKET || !GCS_CLIENT_EMAIL || !GCS_PRIVATE_KEY) {
      return Promise.reject(
        new Error('Set GCS_BUCKET, GCS_CLIENT_EMAIL and GCS_PRIVATE_KEY to upload media.')
      );
    }
    this.bucket ??= Promise.all([
      import('@google-cloud/storage'),
      import('google-auth-library'),
    ]).then(([{ Storage }, { JWT }]) => {
      // A JWT client signs in as the service account. Passing the key as `credentials` instead
      // still works, but google-auth-library warns that it's deprecated.
      const authClient = new JWT({
        email: GCS_CLIENT_EMAIL,
        key: GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
      });
      return new Storage({ authClient }).bucket(GCS_BUCKET);
    });
    return this.bucket;
  }

  public async upload({ fileName, destination }: FileInfo): Promise<boolean> {
    const bucket = await this.getBucket();
    const relativeFile = `${destination.replace(`${this.uploadDir}/`, '')}/${fileName}`;
    const filePath = `${this.uploadDir}/${relativeFile}`;

    await bucket.upload(filePath, { destination: relativeFile });
    logger.info({ file: relativeFile, bucket: bucket.name }, 'Copied an upload to the bucket');

    return true;
  }

  public run(files: FileInfo[]): Promise<boolean[]> {
    return Promise.all(files.map(this.upload, this));
  }
}

export { StorageAdapter };

const adapter = (uploadDir: string): StorageAdapter => new StorageAdapter(uploadDir);

export default adapter;
