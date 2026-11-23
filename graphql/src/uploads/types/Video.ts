import path from 'node:path';

import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

import Upload, { type FileData, type IncomingFile } from './Upload';

interface VideoMetadata {
  description: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface FFProbeStream {
  width?: number;
  height?: number;
  duration?: string | number;
}

export default class Video extends Upload {
  async save(file: IncomingFile): Promise<FileData> {
    const data = await super.save(file);
    const meta: VideoMetadata = {
      description: '',
      type: 'video',
    };

    // A file ffprobe can't read is stored without its size and length
    try {
      const metadata = await ffprobe(path.join(this.destination, this.fileName), {
        path: ffprobeStatic.path,
      });
      if (metadata && metadata.streams) {
        const [video] = metadata.streams as FFProbeStream[];

        if (video.width) {
          meta.width = video.width;
        }

        if (video.height) {
          meta.height = video.height;
        }

        if (video.duration) {
          meta.duration = parseFloat(String(video.duration));
        }
      }
    } catch {
      // stored as it is
    }

    return { ...data, ...meta };
  }
}
