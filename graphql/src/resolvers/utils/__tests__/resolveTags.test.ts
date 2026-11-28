import { ilike } from 'remix/data-table';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import database from '#/database/db';
import { artists as artistsTable } from '#/database/tables';

import resolveArtistTags from '../resolveTags';

const db = vi.hoisted(() => ({ count: vi.fn(), create: vi.fn(), findOne: vi.fn() }));
const resolveTags = (names: string[], newArtists: string[] = []) =>
  resolveArtistTags(database, names, newArtists);

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('#/database/tables', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/database/tables')>()),
  newId: () => `new-${db.create.mock.calls.length + 1}`,
}));

/** The artists there are, by name */
function artists(names: Record<string, string>) {
  db.findOne.mockImplementation(async (_table, { where }) => {
    const id = names[where.value.toLowerCase()];
    return id ? { id } : null;
  });
}

describe('resolveTags', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.count.mockResolvedValue(0);
  });

  it('answers the artists the names belong to, in the order given', async () => {
    artists({ phish: 'artist-1', 'the national': 'artist-2' });

    await expect(resolveTags(['The National', 'Phish'])).resolves.toEqual(['artist-2', 'artist-1']);
    expect(db.create).not.toHaveBeenCalled();
  });

  it('adds the artists that are new', async () => {
    artists({ phish: 'artist-1' });

    await expect(resolveTags(['Phish', 'Sum 41'])).resolves.toEqual(['artist-1', 'new-1']);
    expect(db.create).toHaveBeenCalledExactlyOnceWith(artistsTable, {
      id: 'new-1',
      name: 'Sum 41',
      slug: 'sum-41',
    });
  });

  it('collects the newly added artists for enrichment after commit', async () => {
    artists({ phish: 'artist-1' });

    const added: string[] = [];
    await resolveTags(['Phish', 'Sum 41'], added);
    expect(added).toEqual(['new-1']);
  });

  it('finds an artist however the name is capitalized or spaced', async () => {
    artists({ 'the national': 'artist-2' });

    await expect(resolveTags([' the national '])).resolves.toEqual(['artist-2']);
    expect(db.findOne).toHaveBeenCalledWith(
      artistsTable,
      expect.objectContaining({ where: ilike('name', 'the national') })
    );
    expect(db.create).not.toHaveBeenCalled();
  });

  it('matches a name with % or _ as those characters, not as wildcards', async () => {
    artists({});

    await resolveTags(['100%_Hits']);

    expect(db.findOne).toHaveBeenCalledWith(
      artistsTable,
      expect.objectContaining({ where: ilike('name', '100\\%\\_Hits') })
    );
  });

  it('adds a new artist once when the name is given twice', async () => {
    artists({});

    await expect(resolveTags(['Wednesday', 'wednesday', ''])).resolves.toEqual(['new-1']);
    expect(db.create).toHaveBeenCalledTimes(1);
  });
});
