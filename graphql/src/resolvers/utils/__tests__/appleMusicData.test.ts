import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CatalogArtist } from '#/appleMusic';

import { fillAppleMusic, fillAppleMusicLater } from '../appleMusicData';

const db = vi.hoisted(() => ({
  artist: { findMany: vi.fn() },
  appleMusicData: { create: vi.fn() },
}));
const appleMusic = vi.hoisted(() => ({ hasAppleMusicKeys: vi.fn(), searchArtists: vi.fn() }));
const logger = vi.hoisted(() => ({ warn: vi.fn() }));

vi.mock('#/database', () => ({ default: db }));
vi.mock('#/appleMusic', () => appleMusic);
vi.mock('@highforthis/shared/logger', () => ({ createLogger: () => logger }));

const artwork = { width: 2400, height: 2400, url: 'https://art/{w}x{h}.jpg' };

const catalogArtist = (id: string, name: string, details: Partial<CatalogArtist> = {}) => ({
  id,
  name,
  url: `https://music.apple.com/us/artist/${id}`,
  genreNames: ['Rock'],
  artwork,
  ...details,
});

/** What Apple Music finds for each name */
function catalog(found: Record<string, CatalogArtist[]>) {
  appleMusic.searchArtists.mockImplementation(async (name: string) => found[name] ?? []);
}

describe('fillAppleMusic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    appleMusic.hasAppleMusicKeys.mockReturnValue(true);
    db.artist.findMany.mockResolvedValue([{ id: 'artist-1', name: "Gov't Mule" }]);
  });

  it('saves the data of the artist Apple Music has under the same name', async () => {
    catalog({
      "Gov't Mule": [catalogArtist('1', 'Gov’t Mule Tribute'), catalogArtist('2', 'Gov’t Mule')],
    });

    await expect(fillAppleMusic(['artist-1'])).resolves.toBe(1);

    expect(db.artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ['artist-1'] }, appleMusic: { is: null } } })
    );
    expect(db.appleMusicData.create).toHaveBeenCalledExactlyOnceWith({
      data: {
        artistId: 'artist-1',
        appleId: '2',
        url: 'https://music.apple.com/us/artist/2',
        genreNames: { create: [{ name: 'Rock' }] },
        artwork: { create: artwork },
      },
    });
  });

  it('saves what there is of an artist without artwork', async () => {
    catalog({
      "Gov't Mule": [catalogArtist('2', "Gov't Mule", { artwork: null, genreNames: [] })],
    });

    await fillAppleMusic(['artist-1']);

    expect(db.appleMusicData.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ artwork: undefined, genreNames: { create: [] } }),
    });
  });

  it('leaves an artist alone when Apple Music only has artists with other names', async () => {
    catalog({
      "Gov't Mule": [catalogArtist('1', 'Mule'), catalogArtist('3', 'Gov’t Mule Tribute')],
    });

    await expect(fillAppleMusic(['artist-1'])).resolves.toBe(0);
    expect(db.appleMusicData.create).not.toHaveBeenCalled();
  });

  it('carries on with the next artist when a lookup fails', async () => {
    db.artist.findMany.mockResolvedValue([
      { id: 'artist-1', name: "Gov't Mule" },
      { id: 'artist-2', name: 'Rostam' },
    ]);
    appleMusic.searchArtists
      .mockRejectedValueOnce(new Error('Apple Music returned HTTP 500.'))
      .mockResolvedValueOnce([catalogArtist('9', 'Rostam')]);

    await expect(fillAppleMusic(['artist-1', 'artist-2'])).resolves.toBe(1);
    expect(db.appleMusicData.create).toHaveBeenCalledExactlyOnceWith({
      data: expect.objectContaining({ artistId: 'artist-2', appleId: '9' }),
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ artist: "Gov't Mule" }),
      expect.any(String)
    );
  });

  it('asks nothing of Apple Music without its key, or without artists', async () => {
    await expect(fillAppleMusic([])).resolves.toBe(0);
    appleMusic.hasAppleMusicKeys.mockReturnValue(false);
    await expect(fillAppleMusic(['artist-1'])).resolves.toBe(0);

    expect(db.artist.findMany).not.toHaveBeenCalled();
    expect(appleMusic.searchArtists).not.toHaveBeenCalled();
  });
});

describe('fillAppleMusicLater', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    appleMusic.hasAppleMusicKeys.mockReturnValue(true);
  });

  it('logs a failure instead of rejecting, since nothing waits for it', async () => {
    db.artist.findMany.mockRejectedValue(new Error('database unavailable'));

    fillAppleMusicLater(['artist-1']);

    await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());
  });
});
