import 'dotenv/config';
import path from 'node:path';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    async resolve({ datasourceUrl }) {
      return {
        url: datasourceUrl ?? process.env.DATABASE_URL!,
      };
    },
  },
});
