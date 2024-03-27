import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import mediaStorage from './Storage';
import type { StorageAdapter } from './adapter';
import mediaAdapter from './adapter';
import mediaMiddleware from './handler';

const multerMiddleware =
  (uploadDir: string) => (req: Request, res: Response, next: NextFunction) => {
    const adapter: StorageAdapter = mediaAdapter(uploadDir);
    const storage = mediaStorage({ uploadDir, models: req.context, adapter });
    const upload = multer({ storage });
    return upload.array('uploads')(req, res, next);
  };

export { multerMiddleware, mediaMiddleware };
