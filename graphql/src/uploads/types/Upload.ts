import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import type { Callback, UploadOpts } from '../Storage';
import type { StorageAdapter } from '../adapter';

import { type CropSetting } from './Image';

// A file to store: a `File`, or a file upload as it streams in from the request
export type IncomingFile = Pick<File, 'name' | 'type' | 'stream'>;

export interface FileData {
  fileName: string;
  destination: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
  type?: string;
  // Image fields
  width?: number;
  height?: number;
  title?: string;
  caption?: string;
  altText?: string;
  crops?: { fileName: string; fileSize: number; width: number; height: number }[];
  // Audio fields
  album?: string;
  artist?: string[];
  albumArtist?: string[];
  genre?: string[];
  year?: number;
  duration?: number;
  description?: string;
  images?: { fileName: string; fileSize: number; width: number; height: number }[];
  image?: { fileName: string; fileSize: number; width: number; height: number }[];
}

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

  async setDestination() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const uploadsFolder = path.join(this.uploadDir, `${d.getFullYear()}`, month);
    await fs.promises.mkdir(uploadsFolder, { recursive: true });
    this.destination = uploadsFolder;
  }

  async setFileProps(file: IncomingFile): Promise<void> {
    await this.setDestination();
    this.ext = path.extname(file.name);
    return new Promise((resolve, reject) => {
      crypto.randomBytes(8, (err, raw) => {
        if (err) {
          reject(err);
        } else {
          this.basename = raw.toString('hex');
          this.fileName = `${this.basename}${this.ext}`;
          resolve();
        }
      });
    });
  }

  async save(file: IncomingFile, cb: Callback) {
    await this.setFileProps(file);

    const finalPath = path.join(this.destination, this.fileName);
    const outStream = fs.createWriteStream(finalPath);
    try {
      // Rejects if either stream fails, such as when the upload is cut off
      await pipeline(file.stream(), outStream);
    } catch (error) {
      cb(error as Error);
      return;
    }
    cb(null, {
      fileName: this.fileName,
      destination: this.destination.replace(`${this.uploadDir}/`, ''),
      mimeType: file.type,
      originalName: file.name,
      fileSize: outStream.bytesWritten,
    });
  }

  toArray() {
    return [{ destination: this.destination, fileName: this.fileName }];
  }

  async process(adapter: StorageAdapter) {
    const files = this.toArray();
    return adapter.run(files);
  }
}
