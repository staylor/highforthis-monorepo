import fs from 'node:fs';

import type { Request } from 'express';

import prisma from '#/database';

import type { StorageAdapter } from './adapter';
import Audio from './types/Audio';
import Image from './types/Image';
import Upload from './types/Upload';
import Video from './types/Video';

export type Callback = (error: Error | null, info?: Partial<Express.Multer.File>) => void;

export interface UploadOpts {
  uploadDir: string;
  settings: { crops: { width: number | null; height: number | null }[] };
}

interface StorageOpts {
  uploadDir: string;
  adapter: StorageAdapter;
}

// Saves a file as the kind of upload its MIME type calls for, with an image's crops, and copies
// the results to the bucket
export async function storeFile(
  file: Express.Multer.File,
  uploadDir: string,
  adapter?: StorageAdapter
) {
  const mediaSettings = await prisma.mediaSettings.findUnique({
    where: { id: 'media' },
  });

  let upload: Upload;
  const crops = mediaSettings
    ? await prisma.mediaCropSetting.findMany({ where: { mediaSettingsId: mediaSettings.id } })
    : [];
  const uploadOpts: UploadOpts = { uploadDir, settings: { crops } };
  if (file.mimetype.startsWith('image/')) {
    upload = new Image(uploadOpts);
  } else if (file.mimetype.startsWith('audio/')) {
    upload = new Audio(uploadOpts);
  } else if (file.mimetype.startsWith('video/')) {
    upload = new Video(uploadOpts);
  } else {
    upload = new Upload(uploadOpts);
  }
  const { promise, resolve, reject } = Promise.withResolvers<Partial<Express.Multer.File>>();
  upload.save(file, async (err, fileData) => {
    if (err) {
      reject(err);
      return;
    }
    try {
      if (adapter) {
        await upload.process(adapter);
      }
      resolve(fileData ?? {});
    } catch (error) {
      reject(error);
    }
  });
  return promise;
}

class Storage {
  opts: StorageOpts;

  public constructor(opts: StorageOpts) {
    this.opts = opts;
  }

  public async _handleFile(_req: Request, file: Express.Multer.File, cb: Callback) {
    let info;
    try {
      info = await storeFile(file, this.opts.uploadDir, this.opts.adapter);
    } catch (error) {
      cb(error as Error);
      return;
    }
    cb(null, info);
  }

  public _removeFile(_req: Request, file: Express.Multer.File, cb: Callback) {
    const { path: filePath } = file;

    fs.unlink(filePath, cb);
  }
}

export default (opts: StorageOpts): Storage => new Storage(opts);
