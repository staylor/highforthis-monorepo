import path from 'node:path';
import { Readable } from 'node:stream';

import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import mediaStorage, { storeFile } from './Storage';
import mediaAdapter from './adapter';
import mediaMiddleware, { createMediaUpload } from './handler';

// Uploads are written here, then copied to the bucket
export const uploadDir = path.join(process.cwd(), 'public/uploads');

const multerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const storage = mediaStorage({ uploadDir, adapter: mediaAdapter(uploadDir) });
  const upload = multer({ storage });
  return upload.array('uploads')(req, res, next);
};

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Adds an image from the web to the media library, the same way uploading it would
export async function uploadFromUrl(
  url: string,
  name: string,
  details: { title: string; altText: string }
) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  const mimetype = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
  const ext = IMAGE_EXTENSIONS[mimetype];
  if (!response.ok || !ext) {
    throw new Error(`Could not download ${url}: HTTP ${response.status}, ${mimetype || 'no type'}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const file: Express.Multer.File = {
    fieldname: 'uploads',
    originalname: `${name}${ext}`,
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    stream: Readable.from(buffer),
    destination: '',
    filename: '',
    path: '',
    buffer,
  };
  const stored = await storeFile(file, uploadDir, mediaAdapter(uploadDir));
  return createMediaUpload({ ...stored, ...details });
}

export { multerMiddleware, mediaMiddleware };
