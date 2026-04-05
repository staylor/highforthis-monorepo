import path from 'node:path';

import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

import type { Callback } from '../Storage';

import Upload, { type FileData } from './Upload';

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
  async save(file: Express.Multer.File, cb: Callback) {
    const callback: Callback = async (err, data) => {
      const finalPath = path.join(this.destination, this.fileName);
      const meta: VideoMetadata = {
        description: '',
        type: 'video',
      };

      try {
        const metadata = await ffprobe(finalPath, { path: ffprobeStatic.path });
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
        // silence is golden
      }

      cb(err, {
        ...(data as FileData),
        ...meta,
      } as Partial<Express.Multer.File>);
    };
    super.save(file, callback);
  }
}
