import type { Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      context: any;
    }
  }
}

interface FileCopy {
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  [key: string]: any;
}

const uploadFields = ['fieldname', 'originalname', 'encoding', 'mimetype'];

export default async (req: Request, res: Response) => {
  const files: FileCopy[] = (req.files as any[]).map((file): FileCopy => {
    const fileCopy = { ...file };
    uploadFields.forEach((field: string) => {
      delete fileCopy[field];
    });
    return fileCopy;
  });

  const { prisma } = req.context;
  const ids = await Promise.all(
    files.map(async (file: FileCopy) => {
      const record = await prisma.mediaUpload.create({ data: file });
      return record.id;
    })
  );
  res.json(ids);
};
