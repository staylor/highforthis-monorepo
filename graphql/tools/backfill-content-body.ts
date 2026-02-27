import 'dotenv/config';

import { Prisma } from '@prisma/client';

import prisma from '#/database';
import { extractText } from '#/utils/lexical';

async function main() {
  const posts = await prisma.post.findMany({
    where: { editorState: { not: Prisma.JsonNull } },
    select: { id: true, slug: true, editorState: true },
  });

  let updated = 0;
  for (const post of posts) {
    const contentBody = extractText(post.editorState);
    if (contentBody) {
      await prisma.post.update({
        where: { id: post.id },
        data: { contentBody },
      });
      updated++;
      console.log(`  ${post.slug}: ${contentBody.length} chars`);
    }
  }

  console.log(`\nBackfilled contentBody for ${updated} posts.`);
}

try {
  await main();
} catch (e) {
  console.error('Backfill failed:', e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
