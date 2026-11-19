import path from 'node:path';

import { storeFile } from './Storage';
import mediaAdapter from './adapter';
import handleUploads, { createMediaUpload } from './handler';

// Uploads are written here, then copied to the bucket
export const uploadDir = path.join(process.cwd(), 'public/uploads');

/** `POST /upload`: stores the files in the `uploads` field and answers with their media IDs. */
export const uploadHandler = ({ request }: { request: Request }) =>
  handleUploads(request, uploadDir);

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

  const file = new File([await response.arrayBuffer()], `${name}${ext}`, { type: mimetype });
  const stored = await storeFile(file, uploadDir, mediaAdapter(uploadDir));
  return createMediaUpload({ ...stored, ...details });
}
