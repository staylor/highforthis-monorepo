import type { PrismaClient } from '@prisma/client';

export interface ModelContext {
  prisma: PrismaClient;
}

export interface FileInfo {
  fileName: string;
  destination: string;
}
