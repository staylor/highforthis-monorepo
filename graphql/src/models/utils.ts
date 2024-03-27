import type { Collection } from 'mongodb';
import slugifyUtil from 'slugify';

const removePattern = /[#,$*_+~.()[]\/'"!-:@]/g;

export function slugify(value: string): string {
  return slugifyUtil(value, {
    lower: true,
    strict: true,
    remove: removePattern,
  });
}

export async function getUniqueSlug(collection: Collection, slugToCheck: string): Promise<string> {
  const slugified = slugify(slugToCheck);
  let slug = slugified;

  const count = async (checkSlug: string): Promise<number> => collection.count({ slug: checkSlug });

  let i = 0;
  let num;
  do {
    if (i > 0) {
      slug = `${slugified}-${i}`;
    }
    i += 1;
    num = await count(slug);
  } while (num > 0);

  return slug;
}
