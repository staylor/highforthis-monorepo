import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { mkdirp } from 'mkdirp';

import type { Callback, UploadOpts } from '../Storage';
import type { StorageAdapter } from '../adapter';

import { type CropSetting } from './Image';

export default class Upload {
  uploadDir: string;
  settings: {
    crops: CropSetting[];
  };
  // the relative folder path without the file name
  destination: string = '';
  // the obfuscated filename, without an extension
  basename: string = '';
  // the extension of the file
  ext: string = '';
  // the obfuscated fileName + it's extension
  fileName: string = '';

  constructor(opts: UploadOpts) {
    this.uploadDir = opts.uploadDir;
    this.settings = opts.settings;
  }

  setDestination() {
    const d = new Date();
    const month = d.getMonth() + 1;
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const uploadsFolder = path.join(this.uploadDir, `${d.getFullYear()}`, monthStr);
    mkdirp.sync(uploadsFolder);
    this.destination = uploadsFolder;
  }

  setFileProps(file: Express.Multer.File): Promise<void> {
    this.setDestination();
    this.ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
    return new Promise((resolve, reject) => {
      crypto.pseudoRandomBytes(8, (err, raw) => {
        if (err) {
          reject(err);
        } else {
          const filename = raw.toString('hex');
          this.basename = filename;
          this.fileName = `${this.basename}${this.ext}`;
          resolve();
        }
      });
    });
  }

  async save(file: Express.Multer.File, cb: Callback) {
    await this.setFileProps(file);

    const finalPath = path.join(this.destination, this.fileName);
    const outStream = fs.createWriteStream(finalPath);
    outStream.on('error', cb);
    outStream.on('finish', () => {
      cb(null, {
        fileName: this.fileName,
        destination: this.destination.replace(`${this.uploadDir}/`, ''),
        mimeType: file.mimetype,
        originalName: file.originalname,
        fileSize: outStream.bytesWritten,
      } as any);
    });

    file.stream.pipe(outStream);
  }

  toArray() {
    return [{ destination: this.destination, fileName: this.fileName }];
  }

  async process(adapter: StorageAdapter) {
    if (!adapter) {
      return Promise.resolve();
    }

    const files = this.toArray();
    if (!files || !files.length) {
      return Promise.resolve();
    }

    return adapter.run(files);
  }
}
