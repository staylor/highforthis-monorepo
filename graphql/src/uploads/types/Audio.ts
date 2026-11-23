import fs from 'node:fs';
import path from 'node:path';

import mm from 'musicmetadata';

import type { CropInfo } from './Image';
import Upload, { type FileData, type IncomingFile } from './Upload';

interface AudioMetadata {
  title: string;
  artist: string[];
  albumArtist: string[];
  genre: string[];
  description: string;
  type: string;
  images: CropInfo[];
  year?: number;
  album?: string;
  duration?: number;
}

export default class Audio extends Upload {
  images: CropInfo[] = [];

  async extractCovers(metadata: MM.Metadata): Promise<CropInfo[]> {
    const { default: sharp } = await import('sharp');
    return Promise.all(
      (metadata.picture || []).map(async ({ data, format }: MM.Picture, i: number) => {
        const coverName = `${this.basename}-cover-${i}.${format}`;
        const info = await sharp(data).toFile(path.join(this.destination, coverName));
        return { fileName: coverName, fileSize: info.size, width: info.width, height: info.height };
      })
    );
  }

  readMetadata(): Promise<MM.Metadata> {
    return new Promise((resolve, reject) => {
      const audioStream = fs.createReadStream(path.join(this.destination, this.fileName));
      mm(audioStream, { duration: true }, (err, metadata: MM.Metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  async save(file: IncomingFile): Promise<FileData> {
    const data = await super.save(file);
    const meta: AudioMetadata = {
      title: '',
      artist: [],
      albumArtist: [],
      genre: [],
      description: '',
      type: 'audio',
      images: [],
    };

    // A file whose tags can't be read is stored without them
    try {
      const metadata = await this.readMetadata();
      if (metadata.picture && metadata.picture.length > 0) {
        this.images = await this.extractCovers(metadata);
        meta.images = this.images;
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
    } catch {
      // stored as it is
    }

    return { ...data, ...meta };
  }

  toArray() {
    return super.toArray().concat(
      this.images.map((image) => ({
        destination: this.destination,
        fileName: image.fileName,
      }))
    );
  }
}
