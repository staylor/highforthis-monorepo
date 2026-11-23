import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Artist';

const db = vi.hoisted(() => ({
  count: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  transaction: vi.fn(),
  update: vi.fn(),
}));
const fillAppleMusic = vi.hoisted(() => vi.fn());

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('#/database/tables', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/database/tables')>()),
  newId: () => 'artist-1',
}));
vi.mock('../utils/appleMusicData', () => ({ fillAppleMusic, saveAppleMusic: vi.fn() }));

const saved = { id: 'artist-1', name: 'Rostam', slug: 'rostam', appleMusic: null };
const withData = { ...saved, appleMusic: { appleId: '9', artwork: { url: 'https://art' } } };

describe('saving an artist', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.count.mockResolvedValue(0);
    db.transaction.mockImplementation((save: (tx: typeof db) => unknown) => save(db));
    db.update.mockResolvedValue(saved);
  });

  it("answers a new artist with Apple Music's data, when Apple Music has the artist", async () => {
    db.find.mockResolvedValueOnce(saved).mockResolvedValueOnce(withData);
    fillAppleMusic.mockResolvedValue(1);

    const artist = await resolvers.Mutation.createArtist({}, { input: { name: 'Rostam' } });

    expect(db.create).toHaveBeenCalledWith(expect.anything(), {
      name: 'Rostam',
      id: 'artist-1',
      slug: 'rostam',
    });
    expect(fillAppleMusic).toHaveBeenCalledExactlyOnceWith(['artist-1']);
    expect(artist).toBe(withData);
  });

  it('answers the artist as saved when Apple Music has none of that name', async () => {
    db.find.mockResolvedValue(saved);
    fillAppleMusic.mockResolvedValue(0);

    await expect(resolvers.Mutation.createArtist({}, { input: { name: 'Rostam' } })).resolves.toBe(
      saved
    );
    expect(db.find).toHaveBeenCalledTimes(1);
  });

  it('looks again when an artist without the data is saved', async () => {
    db.find.mockResolvedValue(withData);
    fillAppleMusic.mockResolvedValue(1);

    const artist = await resolvers.Mutation.updateArtist(
      {},
      { id: 'artist-1', input: { website: 'https://rostam.com' } }
    );

    expect(fillAppleMusic).toHaveBeenCalledExactlyOnceWith(['artist-1']);
    expect(artist).toBe(withData);
  });

  it('asks Apple Music nothing about an artist that has the data', async () => {
    db.update.mockResolvedValue(withData);

    await expect(
      resolvers.Mutation.updateArtist({}, { id: 'artist-1', input: { name: 'Rostam' } })
    ).resolves.toBe(withData);
    expect(fillAppleMusic).not.toHaveBeenCalled();
  });
});
