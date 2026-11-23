import { describe, expect, it, vi } from 'vitest';

import { getUniqueSlug } from '../utils';

/** A table where `taken` slugs are in use */
const table = (...taken: string[]) => ({
  count: vi.fn(async ({ where }: { where: { slug: string } }) =>
    Number(taken.includes(where.slug))
  ),
});

describe('getUniqueSlug', () => {
  it.each([
    ['Blink-182', 'blink-182'],
    ['311', '311'],
    ['Maroon 5', 'maroon-5'],
    ['Best Albums of 2025', 'best-albums-of-2025'],
    [
      'Metric, “Help I’m Alive” live at Brooklyn Steel 10/26/22',
      'metric-help-im-alive-live-at-brooklyn-steel-102622',
    ],
  ])('keeps the digits of %s', async (name, slug) => {
    await expect(getUniqueSlug(table(), name)).resolves.toBe(slug);
  });

  it.each([
    ["Guns N' Roses", 'guns-n-roses'],
    ['Sigur Rós', 'sigur-ros'],
    ['AC/DC', 'acdc'],
    ['  The National  ', 'the-national'],
  ])('leaves out the punctuation and accents of %s', async (name, slug) => {
    await expect(getUniqueSlug(table(), name)).resolves.toBe(slug);
  });

  it('adds a number to a slug that is taken', async () => {
    const artists = table('the-national', 'the-national-1');

    await expect(getUniqueSlug(artists, 'The National')).resolves.toBe('the-national-2');
  });

  it('never answers an empty slug, which no page could have', async () => {
    await expect(getUniqueSlug(table(), '!!!')).resolves.toBe('untitled');
    await expect(getUniqueSlug(table('untitled'), '!!!')).resolves.toBe('untitled-1');
  });
});
