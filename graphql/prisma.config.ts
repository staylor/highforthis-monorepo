import path from 'node:path';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  envPath: path.join(__dirname, '.env'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
