import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

import type { Callback } from '../Storage';

import Upload from './Upload';

export type CropInfo = {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
};

export type CropSetting = {
  width: number;
  height: number;
};

export default class Image extends Upload {
  crops: CropInfo[] = [];

  handleCrop(src: string, size: (number | null)[]): Promise<CropInfo> {
    return new Promise((resolve, reject) => {
      const [width = null, height = null] = size;
      const cropName = `${this.basename}-${width || 0}x${height || 0}${this.ext}`;
      const cropPath = path.join(this.destination, cropName);

      const w = size[0] || undefined;
      const h = size[1] || undefined;

      const opts = {
        withoutEnlargement: true,
      };

      return sharp(src)
        .resize(w, h, opts)
        .toFile(cropPath, (err, info) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              fileName: cropName,
              fileSize: info.size,
              width: info.width,
              height: info.height,
            });
          }
        });
    });
  }

  async save(file: Express.Multer.File, cb: Callback) {
    await this.setFileProps(file);

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

    const outStream = fs.createWriteStream(finalPath);
    outStream.on('error', cb);
    outStream.on('finish', async () => {
      const sizes = this.settings.crops.map(({ width, height }: CropSetting) => {
        if (width < original.width && height > original.height) {
          return [width];
        }
        if (height < original.height && width > original.width) {
          return [null, height];
        }
        return [width, height];
      });

      this.crops = await Promise.all(sizes.map((size) => this.handleCrop(finalPath, size)));

      cb(null, {
        ...original,
        mimeType: file.mimetype,
        originalName: file.originalname,
        destination: this.destination.replace(`${this.uploadDir}/`, ''),
        title: '',
        caption: '',
        altText: '',
        type: 'image',
        crops: this.crops,
      } as any);
    });

    file.stream.pipe(imageMeta).pipe(outStream);
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
