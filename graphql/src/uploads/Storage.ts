import fs from 'node:fs';

import type { PrismaClient } from '@prisma/client';
import type { Request } from 'express';

import type { StorageAdapter } from './adapter';
import Audio from './types/Audio';
import Image from './types/Image';
import Upload from './types/Upload';
import Video from './types/Video';

export type Callback = (error?: any, info?: Partial<Express.Multer.File>) => void;

export interface UploadOpts {
  uploadDir: string;
  settings: any;
}

export interface FileInfo {
  fileName: string;
  destination: string;
}

interface StorageOpts {
  prisma: PrismaClient;
  uploadDir: string;
  adapter: StorageAdapter;
}

class Storage {
  opts: StorageOpts;

  public constructor(opts: StorageOpts) {
    this.opts = opts;
  }

  public async _handleFile(_req: Request, file: Express.Multer.File, cb: Callback) {
    const mediaSettings = await this.opts.prisma.mediaSettings.findUnique({
      where: { id: 'media' },
    });

    let upload: Upload;
    const uploadOpts = {
      uploadDir: this.opts.uploadDir,
      settings: mediaSettings || { crops: [] },
    };
    if (file.mimetype.indexOf('image/') === 0) {
      upload = new Image(uploadOpts);
    } else if (file.mimetype.indexOf('audio/') === 0) {
      upload = new Audio(uploadOpts);
    } else if (file.mimetype.indexOf('video/') === 0) {
      upload = new Video(uploadOpts);
    } else {
      upload = new Upload(uploadOpts);
    }
    upload.save(file, async (err, fileData) => {
      if (this.opts.adapter) {
        await upload.process(this.opts.adapter);
      }
      cb(err, fileData);
    });
  }

  public _removeFile(_req: Request, file: Express.Multer.File, cb: Callback) {
    const { path: filePath } = file;
    const f = file as any;

    delete f.destination;
    delete f.filename;
    delete f.path;

    fs.unlink(filePath, cb);
  }
}

export default (opts: StorageOpts): Storage => new Storage(opts);
