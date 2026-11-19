import prisma from '#/database';

import type { StorageAdapter } from './adapter';
import Audio from './types/Audio';
import Image from './types/Image';
import Upload, { type FileData, type IncomingFile } from './types/Upload';
import Video from './types/Video';

export type Callback = (error: Error | null, info?: FileData) => void;

export interface UploadOpts {
  uploadDir: string;
  settings: { crops: { width: number | null; height: number | null }[] };
}

// Saves a file as the kind of upload its MIME type calls for, with an image's crops, and copies
// the results to the bucket
export async function storeFile(file: IncomingFile, uploadDir: string, adapter?: StorageAdapter) {
  const mediaSettings = await prisma.mediaSettings.findUnique({
    where: { id: 'media' },
  });

  let upload: Upload;
  const crops = mediaSettings
    ? await prisma.mediaCropSetting.findMany({ where: { mediaSettingsId: mediaSettings.id } })
    : [];
  const uploadOpts: UploadOpts = { uploadDir, settings: { crops } };
  if (file.type.startsWith('image/')) {
    upload = new Image(uploadOpts);
  } else if (file.type.startsWith('audio/')) {
    upload = new Audio(uploadOpts);
  } else if (file.type.startsWith('video/')) {
    upload = new Video(uploadOpts);
  } else {
    upload = new Upload(uploadOpts);
  }
  const { promise, resolve, reject } = Promise.withResolvers<FileData>();
  upload
    .save(file, async (err, fileData) => {
      if (err || !fileData) {
        reject(err ?? new Error('The upload was saved without its details'));
        return;
      }
      try {
        if (adapter) {
          await upload.process(adapter);
        }
        resolve(fileData);
      } catch (error) {
        reject(error);
      }
    })
    .catch(reject);
  return promise;
}
