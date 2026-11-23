import slugifyUtil from 'slugify';

// A name with no letters or digits, like the band !!!, has nothing to make a slug from
const EMPTY_SLUG = 'untitled';

/** The name in lowercase letters and digits, with hyphens between its words */
function slugify(value: string): string {
  return slugifyUtil(value, { lower: true, strict: true }) || EMPTY_SLUG;
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
