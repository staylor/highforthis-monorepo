import prisma from '~/database';
import shows from '~/jobs/shows';

await shows(prisma);

process.exit(0);
