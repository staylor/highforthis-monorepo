import path from 'node:path';

import Upload, { type FileData, type IncomingFile } from './Upload';

interface VideoMetadata {
  description: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
}

export default class Video extends Upload {
  async save(file: IncomingFile): Promise<FileData> {
    const data = await super.save(file);
    const meta: VideoMetadata = {
      description: '',
      type: 'video',
    };

    // A file whose details can't be read is stored without its size and length
    try {
      // Imported on first use, like the other libraries only uploads need
      const { parseFile } = await import('music-metadata');
      const { format } = await parseFile(path.join(this.destination, this.fileName));
      const video = format.trackInfo?.find((track) => track.video)?.video;

      if (video?.pixelWidth) {
        meta.width = video.pixelWidth;
      }

      if (video?.pixelHeight) {
        meta.height = video.pixelHeight;
      }

      if (format.duration) {
        meta.duration = format.duration;
      }
    } catch {
      // stored as it is
    }

    return { ...data, ...meta };
  }
}
