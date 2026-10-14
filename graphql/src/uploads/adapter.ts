import type { Bucket } from '@google-cloud/storage';

import env from '#/env';

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
    this.bucket ??= import('@google-cloud/storage').then(({ Storage }) =>
      new Storage({
        credentials: {
          client_email: env.GCS_CLIENT_EMAIL,
          private_key: env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      }).bucket(env.GCS_BUCKET)
    );
    return this.bucket;
  }

  public async upload({ fileName, destination }: FileInfo): Promise<boolean> {
    const bucket = await this.getBucket();
    const relativeFile = `${destination.replace(`${this.uploadDir}/`, '')}/${fileName}`;
    const filePath = `${this.uploadDir}/${relativeFile}`;

    await bucket.upload(filePath, { destination: relativeFile });
    console.log(`${relativeFile} uploaded to ${bucket.name}.`);
    // await bucket.file(relativeFile).makePublic();

    return true;
  }

  public run(files: FileInfo[]): Promise<boolean[]> {
    return Promise.all(files.map(this.upload, this));
  }
}

export { StorageAdapter };

const adapter = (uploadDir: string): StorageAdapter => new StorageAdapter(uploadDir);

export default adapter;
