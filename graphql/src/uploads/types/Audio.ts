import path from 'node:path';

import type { IPicture } from 'music-metadata';

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

// The extension a cover is stored under, by the type the file's tags give it
const COVER_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export default class Audio extends Upload {
  images: CropInfo[] = [];

  async extractCovers(pictures: IPicture[]): Promise<CropInfo[]> {
    const { default: sharp } = await import('sharp');
    return Promise.all(
      pictures.flatMap(({ data, format }, i) => {
        const ext = COVER_EXTENSIONS[format.toLowerCase()];
        if (!ext) {
          return [];
        }
        const coverName = `${this.basename}-cover-${i}.${ext}`;
        return [
          sharp(data)
            .toFile(path.join(this.destination, coverName))
            .then((info) => ({
              fileName: coverName,
              fileSize: info.size,
              width: info.width,
              height: info.height,
            })),
        ];
      })
    );
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
      // Imported on first use, like the other libraries only uploads need
      const { parseFile } = await import('music-metadata');
      const { common, format } = await parseFile(path.join(this.destination, this.fileName), {
        duration: true,
      });
      if (common.picture?.length) {
        this.images = await this.extractCovers(common.picture);
        meta.images = this.images;
      }

      if (common.title) {
        meta.title = common.title;
      }

      if (common.artists?.length) {
        meta.artist = common.artists;
      } else if (common.artist) {
        meta.artist = [common.artist];
      }

      if (common.albumartist) {
        meta.albumArtist = [common.albumartist];
      }

      if (common.genre) {
        meta.genre = common.genre;
      }

      if (common.year) {
        meta.year = common.year;
      }

      if (common.album) {
        meta.album = common.album;
      }

      if (format.duration) {
        meta.duration = format.duration;
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
