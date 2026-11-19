import { parseFormData, type FileUpload } from 'remix/form-data-parser/future';
import { z } from 'zod';

import prisma from '#/database';

import { storeFile } from './Storage';
import mediaAdapter from './adapter';
import type { FileData } from './types/Upload';

const imageCropSchema = z.object({
  fileName: z.string(),
  fileSize: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
});

const audioImageSchema = z.object({
  fileName: z.string(),
  fileSize: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
});

const uploadFileSchema = z.object({
  // MediaUpload base fields
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  originalName: z.string(),
  destination: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  type: z.string().optional().default('file'),
  fileSize: z.number().int(),

  // Image-specific
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  caption: z.string().optional(),
  altText: z.string().optional(),
  crops: z.array(imageCropSchema).optional(),

  // Audio-specific
  album: z.string().optional(),
  year: z.number().int().optional(),
  duration: z.number().optional(),
  artist: z.array(z.string()).optional(),
  albumArtist: z.array(z.string()).optional(),
  genre: z.array(z.string()).optional(),
  images: z.array(audioImageSchema).optional(),
  image: z.array(audioImageSchema).optional(),
});

// Records a stored file in the media library, with an image's crops or an audio file's details
export async function createMediaUpload(file: unknown) {
  const { crops, images, artist, albumArtist, genre, image, ...data } =
    uploadFileSchema.parse(file);
  const record = await prisma.mediaUpload.create({ data });

  // Image crops
  if (crops?.length) {
    await prisma.imageUploadCrop.createMany({
      data: crops.map((c) => ({ ...c, mediaId: record.id })),
    });
  }

  // Audio cover images
  if (images?.length) {
    await prisma.audioImage.createMany({
      data: images.map((i) => ({ ...i, mediaId: record.id })),
    });
  } else if (image?.length) {
    // 'image' field from Audio upload metadata extraction
    await prisma.audioImage.createMany({
      data: image.map((i) => ({ ...i, mediaId: record.id })),
    });
  }

  // Audio artists
  if (artist?.length) {
    await prisma.audioArtist.createMany({
      data: artist.map((name) => ({ name, mediaId: record.id })),
    });
  }

  // Audio album artists
  if (albumArtist?.length) {
    await prisma.audioAlbumArtist.createMany({
      data: albumArtist.map((name) => ({ name, mediaId: record.id })),
    });
  }

  // Audio genres
  if (genre?.length) {
    await prisma.audioGenre.createMany({
      data: genre.map((name) => ({ name, mediaId: record.id })),
    });
  }

  return record.id;
}

// Like multer, which took uploads before: no limit on the number or size of files
const limits = { maxFiles: Infinity, maxFileSize: Infinity, maxParts: Infinity };

/**
 * Stores the files posted in the `uploads` field, records them in the media library, and answers
 * with their IDs. Each file is written to disk as it streams in; its crops and its copy to the
 * bucket carry on while the next file arrives.
 */
export default async function handleUploads(request: Request, uploadDir: string) {
  // multer only read multipart bodies, and found no files in anything else
  if (!/^multipart\//i.test(request.headers.get('content-type') ?? '')) {
    return Response.json([]);
  }

  const adapter = mediaAdapter(uploadDir);
  const stored: Promise<FileData>[] = [];

  function store(upload: FileUpload) {
    if (upload.fieldName !== 'uploads') {
      throw new Error(`Unexpected field: ${upload.fieldName}`);
    }
    // The parser moves on to the next part once this file has streamed in
    const { promise: received, resolve } = Promise.withResolvers<void>();
    const stream = upload.stream().pipeThrough(new TransformStream({ flush: () => resolve() }));
    const saved = storeFile(
      { name: upload.name, type: upload.type, stream: () => stream },
      uploadDir,
      adapter
    );
    stored.push(saved);
    return Promise.race([received, saved]).then(() => undefined);
  }

  let parseError: unknown;
  try {
    await parseFormData(request, limits, store);
  } catch (error) {
    parseError = error;
  }
  // Even when one fails, wait for the others, so none is still writing when this answers
  const results = await Promise.allSettled(stored);
  if (parseError) {
    throw parseError;
  }
  const files = results.map((result) => {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    return result.value;
  });
  return Response.json(await Promise.all(files.map(createMediaUpload)));
}
