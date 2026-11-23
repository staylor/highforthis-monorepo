import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolveTags from '../resolveTags';

const artist = vi.hoisted(() => ({ count: vi.fn(), create: vi.fn(), findFirst: vi.fn() }));

vi.mock('#/database', () => ({ default: { artist } }));

/** The artists there are, by name */
function artists(names: Record<string, string>) {
  artist.findFirst.mockImplementation(async ({ where }) => {
    const id = names[where.name.equals.toLowerCase()];
    return id ? { id } : null;
  });
}

describe('resolveTags', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    artist.count.mockResolvedValue(0);
    artist.create.mockImplementation(async ({ data }) => ({ id: `new-${data.slug}` }));
  });

  it('answers the artists the names belong to, in the order given', async () => {
    artists({ phish: 'artist-1', 'the national': 'artist-2' });

    await expect(resolveTags(['The National', 'Phish'])).resolves.toEqual(['artist-2', 'artist-1']);
    expect(artist.create).not.toHaveBeenCalled();
  });

  it('adds the artists that are new', async () => {
    artists({ phish: 'artist-1' });

    await expect(resolveTags(['Phish', 'Sum 41'])).resolves.toEqual(['artist-1', 'new-sum-41']);
    expect(artist.create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ data: { name: 'Sum 41', slug: 'sum-41' } })
    );
  });

  it('finds an artist however the name is capitalized or spaced', async () => {
    artists({ 'the national': 'artist-2' });

    await expect(resolveTags([' the national '])).resolves.toEqual(['artist-2']);
    expect(artist.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: { equals: 'the national', mode: 'insensitive' } } })
    );
    expect(artist.create).not.toHaveBeenCalled();
  });

  it('adds a new artist once when the name is given twice', async () => {
    artists({});

    await expect(resolveTags(['Wednesday', 'wednesday', ''])).resolves.toEqual(['new-wednesday']);
    expect(artist.create).toHaveBeenCalledTimes(1);
  });
});
