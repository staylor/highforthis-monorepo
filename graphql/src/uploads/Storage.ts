import db from '#/database/db';
import { mediaCropSettings } from '#/database/tables';

import type { StorageAdapter } from './adapter';
import { mediaExtension, UploadError } from './mediaTypes';
import Audio from './types/Audio';
import Image from './types/Image';
import type Upload from './types/Upload';
import type { IncomingFile } from './types/Upload';
import Video from './types/Video';

export interface UploadOpts {
  uploadDir: string;
  settings: { crops: { width: number | null; height: number | null }[] };
}

// Saves a file as the kind of upload its MIME type calls for, with an image's crops, and copies
// the results to the bucket. Only images, audio and video are taken.
export async function storeFile(file: IncomingFile, uploadDir: string, adapter?: StorageAdapter) {
  if (!mediaExtension(file.type)) {
    throw new UploadError(
      415,
      `Uploads must be images, audio or video, not ${file.type || 'untyped files'}`
    );
  }
  // The crops belong to the one media settings row
  const crops = await db.findMany(mediaCropSettings, { where: { mediaSettingsId: 'media' } });

  let upload: Upload;
  const uploadOpts: UploadOpts = { uploadDir, settings: { crops } };
  if (file.type.startsWith('image/')) {
    upload = new Image(uploadOpts);
  } else if (file.type.startsWith('audio/')) {
    upload = new Audio(uploadOpts);
  } else {
    upload = new Video(uploadOpts);
  }

  try {
    const fileData = await upload.save(file);
    if (adapter) {
      await upload.process(adapter);
    }
    return fileData;
  } finally {
    // Uploads are served from the bucket, so the copies written here have done their job once
    // it has them, or once the upload has failed
    if (adapter) {
      await upload.removeLocalFiles();
    }
  }
}
