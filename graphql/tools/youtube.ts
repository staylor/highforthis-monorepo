import prisma from '#/database';
import youtube from '#/jobs/youtube';

await youtube(prisma);

process.exit(0);
