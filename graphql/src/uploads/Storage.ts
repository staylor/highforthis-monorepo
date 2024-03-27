import fs from 'node:fs';

import type { Request } from 'express';

import Upload from './types/Upload';
import Image from './types/Image';
import Audio from './types/Audio';
import Video from './types/Video';
import type { StorageAdapter } from './adapter';

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
  models: { Settings: any };
  uploadDir: string;
  adapter: StorageAdapter;
}

class Storage {
  opts: StorageOpts;

  public constructor(opts: StorageOpts) {
    this.opts = opts;
  }

  public async _handleFile(_req: Request, file: Express.Multer.File, cb: Callback) {
    const { Settings } = this.opts.models;
    const mediaSettings = await Settings.findOneById('media');

    let upload: Upload;
    const uploadOpts = {
      uploadDir: this.opts.uploadDir,
      settings: mediaSettings,
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
