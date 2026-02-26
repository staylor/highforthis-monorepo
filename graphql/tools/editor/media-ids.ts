import prisma from '~/database';

const posts = await prisma.post.findMany();

for (const post of posts) {
  await prisma.post.update({
    where: { id: post.id },
    data: { editorState: post.editorState as any },
  });
}

process.exit(0);
