import type { Request, Response } from 'express';
import { z } from 'zod';

import prisma from '#/database';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      context: Record<string, unknown>;
    }
  }
}

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

export default async (_req: Request, res: Response) => {
  const multerFiles = (_req.files ?? []) as Express.Multer.File[];
  const rawFiles = multerFiles.map(
    ({ fieldname: _, originalname: _o, encoding: _e, mimetype: _m, ...rest }) => rest
  );

  const ids = await Promise.all(
    rawFiles.map(async (file) => {
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
    })
  );
  res.json(ids);
};
