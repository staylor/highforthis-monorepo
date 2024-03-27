import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';
import mm from 'musicmetadata';

import type { Callback } from '../Storage';

import Upload from './Upload';
import type { CropInfo } from './Image';

type Metadata = {
  title: string;
  artist: string[];
  albumArtist: string[];
  genre: string[];
  description: string;
  type: string;
  images: any[];
  image?: any;
  year?: number;
  album?: string;
  duration?: number;
};

export default class Audio extends Upload {
  images = [];

  extractCovers(metadata: any): Promise<any> {
    return Promise.all(
      metadata.picture.map(
        ({ data, format }: MM.Picture, i: number): Promise<CropInfo> =>
          new Promise((resolve, reject) => {
            const coverName = `${this.basename}-cover-${i}.${format}`;
            const coverPath = path.join(this.destination, coverName);
            sharp(data).toFile(coverPath, (err, info) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  fileName: coverName,
                  fileSize: info.size,
                  width: info.width,
                  height: info.height,
                });
              }
            });
          })
      )
    );
  }

  async save(file: Express.Multer.File, cb: Callback) {
    const callback: Callback = async (error, data) => {
      const readMetadata = (): Promise<MM.Metadata> =>
        new Promise((resolve, reject) => {
          const finalPath = path.join(this.destination, this.fileName);
          const audioStream = fs.createReadStream(finalPath);
          mm(audioStream, { duration: true }, (err, metadata: MM.Metadata) => {
            if (err) {
              reject(err);
            } else {
              resolve(metadata);
            }
          });
        });

      const meta: Metadata = {
        title: '',
        artist: [],
        albumArtist: [],
        genre: [],
        description: '',
        type: 'audio',
        images: this.images,
      };

      try {
        const metadata = await readMetadata();
        if (metadata.picture && metadata.picture.length > 0) {
          this.images = await this.extractCovers(metadata);
          meta.image = this.images;
        }

        if (metadata.title) {
          meta.title = metadata.title;
        }

        if (metadata.artist) {
          meta.artist = metadata.artist;
        }

        if (metadata.albumartist) {
          meta.albumArtist = metadata.albumartist;
        }

        if (metadata.genre) {
          meta.genre = metadata.genre;
        }

        if (metadata.year) {
          meta.year = parseInt(metadata.year, 10);
        }

        if (metadata.album) {
          meta.album = metadata.album;
        }

        if (metadata.duration) {
          meta.duration = metadata.duration;
        }
      } catch (e) {
        // silence is golden
      }

      cb(error, {
        ...data,
        ...meta,
      });
    };
    super.save(file, callback);
  }

  toArray() {
    return super.toArray().concat(
      this.images.map((image: any) => ({
        destination: this.destination,
        fileName: image.fileName,
      }))
    );
  }
}
