import path from 'node:path';

import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

import type { Callback } from '../Storage';

import Upload from './Upload';

type Metadata = {
  description: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
};

export default class Video extends Upload {
  async save(file: Express.Multer.File, cb: Callback) {
    const callback: Callback = async (err, data) => {
      const finalPath = path.join(this.destination, this.fileName);
      const meta: Metadata = {
        description: '',
        type: 'video',
      };

      try {
        const metadata = await ffprobe(finalPath, { path: ffprobeStatic.path });
        if (metadata && metadata.streams) {
          const [video] = metadata.streams;

          if (video.width) {
            meta.width = video.width;
          }

          if (video.height) {
            meta.height = video.height;
          }

          if (video.duration) {
            meta.duration = parseFloat(video.duration as any);
          }
        }
      } catch (e) {
        // silence is golden
      }

      cb(err, {
        ...data,
        ...meta,
      });
    };
    super.save(file, callback);
  }
}
