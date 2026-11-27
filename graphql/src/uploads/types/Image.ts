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
    // Every frame of an animation, the right way up
    const info = await sharp(src, { animated: true })
      .autoOrient()
      .resize(width || undefined, height || undefined, { withoutEnlargement: true })
      .toFile(path.join(this.destination, cropName));
    // An animation's frames are stacked one above another, each pageHeight high
    return {
      fileName: cropName,
      fileSize: info.size,
      width: info.width,
      height: info.pageHeight ?? info.height,
    };
  }

  /**
   * Makes the image's crops, into `crops`. When one fails, the rest are still made and kept track
   * of, so they can be removed with the image.
   */
  async makeCrops(src: string, image: { width: number; height: number }) {
    const sizes = this.settings.crops.map(({ width, height }: CropSetting) => {
      const w = width ?? 0;
      const h = height ?? 0;
      if (w < image.width && h > image.height) {
        return [w];
      }
      if (h < image.height && w > image.width) {
        return [null, h];
      }
      return [w, h];
    });
    const made = await Promise.allSettled(sizes.map((size) => this.handleCrop(src, size)));
    this.crops = made.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    const failure = made.find((result) => result.status === 'rejected');
    if (failure) {
      throw failure.reason;
    }
  }

  async save(file: IncomingFile): Promise<FileData> {
    await this.setFileProps(file);
    // Imported on first use: libvips adds about 13 MB of RSS to every idle process.
    const { default: sharp } = await import('sharp');

    const finalPath = path.join(this.destination, this.fileName);
    // The file as it was uploaded, until it's known whether it can be stored as it is
    const uploadPath = `${finalPath}.upload`;
    const original = {
      fileName: this.fileName,
      width: 0,
      height: 0,
      fileSize: 0,
    };

    // Rejects if the upload is cut off, or if sharp can't read the image or make its crops, which
    // turns the upload down and removes what it wrote
    try {
      await pipeline(file.stream(), fs.createWriteStream(uploadPath));
      const metadata = await sharp(uploadPath).metadata();
      // The size it's shown at: phones save photos sideways, with EXIF saying which way is up
      original.width = metadata.autoOrient.width;
      original.height = metadata.autoOrient.height;

      // EXIF, XMP and IPTC metadata can say where a photo was taken, so an image with any is
      // written again without it, turned the right way up. Any other is stored as it was uploaded,
      // rather than compressed again, with every frame of an animation.
      if (metadata.exif || metadata.xmp || metadata.iptc) {
        await sharp(uploadPath, { animated: true }).autoOrient().keepIccProfile().toFile(finalPath);
        await fs.promises.rm(uploadPath);
      } else {
        await fs.promises.rename(uploadPath, finalPath);
      }
      original.fileSize = (await fs.promises.stat(finalPath)).size;

      await this.makeCrops(finalPath, original);
    } catch (error) {
      await Promise.all([fs.promises.rm(uploadPath, { force: true }), this.removeLocalFiles()]);
      const message = error instanceof Error ? error.message : '';
      throw /unsupported image format|corrupt|premature end/i.test(message)
        ? new UploadError(415, `${file.type} upload is not an image that can be read`)
        : error;
    }

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
