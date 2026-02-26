import type { PrismaClient } from '@prisma/client';
import slugifyUtil from 'slugify';

const removePattern = /[#,$*_+~.()[\]\/'"!-:@]/g;

export function slugify(value: string): string {
  return slugifyUtil(value, {
    lower: true,
    strict: true,
    remove: removePattern,
  });
}

type SlugCheckDelegate = {
  count: (args: { where: { slug: string } }) => Promise<number>;
};

export async function getUniqueSlug(
  delegate: SlugCheckDelegate,
  slugToCheck: string
): Promise<string> {
  const slugified = slugify(slugToCheck);
  let slug = slugified;

  let i = 0;
  let num;
  do {
    if (i > 0) {
      slug = `${slugified}-${i}`;
    }
    i += 1;
    num = await delegate.count({ where: { slug } });
  } while (num > 0);

  return slug;
}
