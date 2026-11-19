// The media the library takes, by MIME type, with the extension each is stored under. A stored
// file's extension comes from here, never from the uploaded file's name, so nothing is stored as
// HTML or another type a browser would run.
const MEDIA_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/flac': '.flac',
  'audio/ogg': '.ogg',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
};

/** The extension to store a file of this MIME type under, or null when it isn't media. */
export function mediaExtension(mimeType: string): string | null {
  return Object.hasOwn(MEDIA_EXTENSIONS, mimeType) ? MEDIA_EXTENSIONS[mimeType] : null;
}

/** An upload turned down, with the status and message to answer it with. */
export class UploadError extends Error {
  constructor(
    public status: 400 | 413 | 415,
    message: string
  ) {
    super(message);
  }
}
