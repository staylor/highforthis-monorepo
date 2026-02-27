import type { Request, Response } from 'express';

import prisma from '#/database';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      context: any;
    }
  }
}

const uploadFields = ['fieldname', 'originalname', 'encoding', 'mimetype'];

export default async (_req: Request, res: Response) => {
  const files: any[] = (_req.files as any[]).map((file) => {
    const fileCopy = { ...file };
    uploadFields.forEach((field: string) => {
      delete fileCopy[field];
    });
    return fileCopy;
  });

  const ids = await Promise.all(
    files.map(async (file) => {
      const { crops, images, artist, albumArtist, genre, image, ...data } = file;
      const record = await prisma.mediaUpload.create({ data });

      // Image crops
      if (crops?.length) {
        await prisma.imageUploadCrop.createMany({
          data: crops.map((c: any) => ({ ...c, mediaId: record.id })),
        });
      }

      // Audio cover images
      if (images?.length) {
        await prisma.audioImage.createMany({
          data: images.map((i: any) => ({ ...i, mediaId: record.id })),
        });
      } else if (image?.length) {
        // 'image' field from Audio upload metadata extraction
        await prisma.audioImage.createMany({
          data: image.map((i: any) => ({ ...i, mediaId: record.id })),
        });
      }

      // Audio artists
      if (artist?.length) {
        await prisma.audioArtist.createMany({
          data: artist.map((name: string) => ({ name, mediaId: record.id })),
        });
      }

      // Audio album artists
      if (albumArtist?.length) {
        await prisma.audioAlbumArtist.createMany({
          data: albumArtist.map((name: string) => ({ name, mediaId: record.id })),
        });
      }

      // Audio genres
      if (genre?.length) {
        await prisma.audioGenre.createMany({
          data: genre.map((name: string) => ({ name, mediaId: record.id })),
        });
      }

      return record.id;
    })
  );
  res.json(ids);
};
