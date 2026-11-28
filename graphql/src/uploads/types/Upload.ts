import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import type { UploadOpts } from '../Storage';
import type { StorageAdapter } from '../adapter';
import { mediaExtension, standardType } from '../mediaTypes';

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
}

export default class Upload {
  uploadDir: string;
  settings: {
    crops: CropSetting[];
  };
  // the folder the file is written to, inside the upload folder
  destination: string = '';
  // the obfuscated filename, without an extension
  basename: string = '';
  // the extension for the file's MIME type, whatever its name says
  ext: string = '';
  // the obfuscated filename with its extension
  fileName: string = '';
  // the file's MIME type, the standard one where the browser gave another
  mimeType: string = '';

  constructor(opts: UploadOpts) {
    this.uploadDir = opts.uploadDir;
    this.settings = opts.settings;
  }

  async setDestination() {
    const d = new Date();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const uploadsFolder = path.join(this.uploadDir, `${d.getUTCFullYear()}`, month);
    await fs.promises.mkdir(uploadsFolder, { recursive: true });
    this.destination = uploadsFolder;
  }

  async setFileProps(file: IncomingFile): Promise<void> {
    await this.setDestination();
    this.mimeType = standardType(file.type);
    this.ext = mediaExtension(file.type) ?? '';
    this.basename = crypto.randomBytes(8).toString('hex');
    this.fileName = `${this.basename}${this.ext}`;
  }

  /** Writes the file to the upload folder, and answers what the media library records of it. */
  async save(file: IncomingFile): Promise<FileData> {
    await this.setFileProps(file);

    const outStream = fs.createWriteStream(path.join(this.destination, this.fileName));
    // Rejects if either stream fails, such as when the upload is cut off
    await pipeline(file.stream(), outStream);
    return {
      fileName: this.fileName,
      destination: this.destination.replace(`${this.uploadDir}/`, ''),
      mimeType: this.mimeType,
      originalName: file.name,
      fileSize: outStream.bytesWritten,
    };
  }

  /** The file and whatever was made from it, such as an image's crops */
  toArray() {
    return [{ destination: this.destination, fileName: this.fileName }];
  }

  async process(adapter: StorageAdapter) {
    return adapter.run(this.toArray());
  }

  /** Removes the files from the upload folder, which only holds them until the bucket does. */
  async removeLocalFiles() {
    await Promise.allSettled(
      this.toArray()
        .filter(({ fileName }) => fileName)
        .map(({ destination, fileName }) =>
          fs.promises.rm(path.join(destination, fileName), { force: true })
        )
    );
  }
}
