import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { UploadError } from '../mediaTypes';

import Upload, { type FileData, type IncomingFile } from './Upload';

export type CropInfo = {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
};

export type CropSetting = {
  width: number | null;
  height: number | null;
};

export default class Image extends Upload {
  crops: CropInfo[] = [];

  async handleCrop(src: string, size: (number | null)[]): Promise<CropInfo> {
    const { default: sharp } = await import('sharp');
    const [width = null, height = null] = size;
    const cropName = `${this.basename}-${width || 0}x${height || 0}${this.ext}`;
    const info = await sharp(src)
      .resize(width || undefined, height || undefined, { withoutEnlargement: true })
      .toFile(path.join(this.destination, cropName));
    return { fileName: cropName, fileSize: info.size, width: info.width, height: info.height };
  }

  async save(file: IncomingFile): Promise<FileData> {
    await this.setFileProps(file);
    // Imported on first use: libvips adds about 13 MB of RSS to every idle process.
    const { default: sharp } = await import('sharp');

    const finalPath = path.join(this.destination, this.fileName);
    const original = {
      fileName: this.fileName,
      width: 0,
      height: 0,
      fileSize: 0,
    };
    const imageMeta = sharp().on('info', (info) => {
      original.width = info.width;
      original.height = info.height;
      original.fileSize = info.size;
    });

    // Rejects if any stream fails, such as sharp on a file that isn't a readable image, which
    // is turned down and its empty file removed
    try {
      await pipeline(file.stream(), imageMeta, fs.createWriteStream(finalPath));
    } catch (error) {
      await fs.promises.rm(finalPath, { force: true });
      const message = error instanceof Error ? error.message : '';
      throw /unsupported image format|corrupt|premature end/i.test(message)
        ? new UploadError(415, `${file.type} upload is not an image that can be read`)
        : error;
    }

    const sizes = this.settings.crops.map(({ width, height }: CropSetting) => {
      const w = width ?? 0;
      const h = height ?? 0;
      if (w < original.width && h > original.height) {
        return [w];
      }
      if (h < original.height && w > original.width) {
        return [null, h];
      }
      return [w, h];
    });
    this.crops = await Promise.all(sizes.map((size) => this.handleCrop(finalPath, size)));

    return {
      ...original,
      mimeType: file.type,
      originalName: file.name,
      destination: this.destination.replace(`${this.uploadDir}/`, ''),
      title: '',
      caption: '',
      altText: '',
      type: 'image',
      crops: this.crops,
    };
  }

  toArray() {
    return super.toArray().concat(
      this.crops.map((image) => ({
        destination: this.destination,
        fileName: image.fileName,
      }))
    );
  }
}
