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
  'audio/mp4': '.m4a',
  'audio/aac': '.aac',
  'audio/wav': '.wav',
  'audio/flac': '.flac',
  'audio/ogg': '.ogg',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
};

// Types some browsers give these files in place of the standard ones, by the standard type: the
// one the bucket serves the file as. The podcast feed gives each episode's type as it's recorded,
// and audio/mp3, for one, isn't a type podcast apps have to know.
const STANDARD_TYPES: Readonly<Record<string, string>> = {
  'audio/mp3': 'audio/mpeg',
  'audio/x-m4a': 'audio/mp4',
  'audio/x-wav': 'audio/wav',
};

/** The type to record a file of this MIME type as: the standard one, whichever a browser gave. */
export function standardType(mimeType: string): string {
  return Object.hasOwn(STANDARD_TYPES, mimeType) ? STANDARD_TYPES[mimeType] : mimeType;
}

/** The extension to store a file of this MIME type under, or null when it isn't media. */
export function mediaExtension(mimeType: string): string | null {
  const type = standardType(mimeType);
  return Object.hasOwn(MEDIA_EXTENSIONS, type) ? MEDIA_EXTENSIONS[type] : null;
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
