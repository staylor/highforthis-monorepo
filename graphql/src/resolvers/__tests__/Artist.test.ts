import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Artist';

const db = vi.hoisted(() => ({
  artist: { count: vi.fn(), create: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
}));
const fillAppleMusic = vi.hoisted(() => vi.fn());

vi.mock('#/database', () => ({ default: db }));
vi.mock('../utils/appleMusicData', () => ({ fillAppleMusic }));

const saved = { id: 'artist-1', name: 'Rostam', slug: 'rostam', appleMusic: null };
const withData = { ...saved, appleMusic: { appleId: '9', artwork: { url: 'https://art' } } };

describe('saving an artist', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.artist.count.mockResolvedValue(0);
    db.artist.create.mockResolvedValue(saved);
    db.artist.update.mockResolvedValue(saved);
    db.artist.findUniqueOrThrow.mockResolvedValue(withData);
  });

  it("answers a new artist with Apple Music's data, when Apple Music has the artist", async () => {
    fillAppleMusic.mockResolvedValue(1);

    const artist = await resolvers.Mutation.createArtist({}, { input: { name: 'Rostam' } });

    expect(db.artist.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'Rostam', slug: 'rostam', featuredMedia: undefined },
      })
    );
    expect(fillAppleMusic).toHaveBeenCalledExactlyOnceWith(['artist-1']);
    expect(artist).toBe(withData);
  });

  it('answers the artist as saved when Apple Music has none of that name', async () => {
    fillAppleMusic.mockResolvedValue(0);

    await expect(resolvers.Mutation.createArtist({}, { input: { name: 'Rostam' } })).resolves.toBe(
      saved
    );
    expect(db.artist.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it('looks again when an artist without the data is saved', async () => {
    fillAppleMusic.mockResolvedValue(1);

    const artist = await resolvers.Mutation.updateArtist(
      {},
      { id: 'artist-1', input: { website: 'https://rostam.com' } }
    );

    expect(fillAppleMusic).toHaveBeenCalledExactlyOnceWith(['artist-1']);
    expect(artist).toBe(withData);
  });

  it('asks Apple Music nothing about an artist that has the data', async () => {
    db.artist.update.mockResolvedValue(withData);

    await expect(
      resolvers.Mutation.updateArtist({}, { id: 'artist-1', input: { name: 'Rostam' } })
    ).resolves.toBe(withData);
    expect(fillAppleMusic).not.toHaveBeenCalled();
  });
});
