import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CatalogArtist } from '#/appleMusic';
import { appleMusicData, appleMusicGenres } from '#/database/tables';

import { fillAppleMusic, fillAppleMusicLater, saveAppleMusic } from '../appleMusicData';

// The artists query, whose steps each answer the query, and the transaction's database
const { query, tx, upsert, db } = vi.hoisted(() => {
  const query = {
    leftJoin: vi.fn(),
    where: vi.fn(),
    select: vi.fn(),
    orderBy: vi.fn(),
    all: vi.fn(),
  };
  const upsert = vi.fn();
  const tx = {
    create: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findOne: vi.fn(),
    query: () => ({ upsert }),
    update: vi.fn(),
  };
  const db = { query: vi.fn(), transaction: vi.fn() };
  return { query, tx, upsert, db };
});
const appleMusic = vi.hoisted(() => ({ hasAppleMusicKeys: vi.fn(), searchArtists: vi.fn() }));
const logger = vi.hoisted(() => ({ warn: vi.fn() }));

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('#/database/tables', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/database/tables')>()),
  newId: () => 'new-id',
}));
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

function resetMocks() {
  vi.resetAllMocks();
  for (const step of [query.leftJoin, query.where, query.select, query.orderBy]) {
    step.mockReturnValue(query);
  }
  db.query.mockReturnValue(query);
  db.transaction.mockImplementation((save: (database: typeof tx) => unknown) => save(tx));
  appleMusic.hasAppleMusicKeys.mockReturnValue(true);
  query.all.mockResolvedValue([{ id: 'artist-1', name: "Gov't Mule" }]);
}

describe('fillAppleMusic', () => {
  beforeEach(resetMocks);

  it('saves the data of the artist Apple Music has under the same name', async () => {
    catalog({
      "Gov't Mule": [catalogArtist('1', 'Gov’t Mule Tribute'), catalogArtist('2', 'Gov’t Mule')],
    });

    await expect(fillAppleMusic(['artist-1'])).resolves.toBe(1);

    expect(tx.create).toHaveBeenCalledExactlyOnceWith(appleMusicData, {
      appleId: '2',
      url: 'https://music.apple.com/us/artist/2',
      id: 'new-id',
      artistId: 'artist-1',
    });
    expect(tx.createMany).toHaveBeenCalledExactlyOnceWith(appleMusicGenres, [
      { id: 'new-id', appleMusicDataId: 'new-id', name: 'Rock' },
    ]);
    expect(upsert).toHaveBeenCalledExactlyOnceWith(
      { ...artwork, id: 'new-id', appleMusicDataId: 'new-id' },
      { conflictTarget: ['appleMusicDataId'], update: artwork }
    );
  });

  it('saves what there is of an artist without artwork', async () => {
    catalog({
      "Gov't Mule": [catalogArtist('2', "Gov't Mule", { artwork: null, genreNames: [] })],
    });

    await fillAppleMusic(['artist-1']);

    expect(tx.create).toHaveBeenCalledOnce();
    expect(tx.createMany).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  it('leaves an artist alone when Apple Music only has artists with other names', async () => {
    catalog({
      "Gov't Mule": [catalogArtist('1', 'Mule'), catalogArtist('3', 'Gov’t Mule Tribute')],
    });

    await expect(fillAppleMusic(['artist-1'])).resolves.toBe(0);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('carries on with the next artist when a lookup fails', async () => {
    query.all.mockResolvedValue([
      { id: 'artist-1', name: "Gov't Mule" },
      { id: 'artist-2', name: 'Rostam' },
    ]);
    appleMusic.searchArtists
      .mockRejectedValueOnce(new Error('Apple Music returned HTTP 500.'))
      .mockResolvedValueOnce([catalogArtist('9', 'Rostam')]);

    await expect(fillAppleMusic(['artist-1', 'artist-2'])).resolves.toBe(1);
    expect(tx.create).toHaveBeenCalledExactlyOnceWith(
      appleMusicData,
      expect.objectContaining({ artistId: 'artist-2', appleId: '9' })
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ artist: "Gov't Mule" }),
      expect.any(String)
    );
  });

  it('asks nothing of Apple Music without its key, or without artists', async () => {
    await expect(fillAppleMusic([])).resolves.toBe(0);
    appleMusic.hasAppleMusicKeys.mockReturnValue(false);
    await expect(fillAppleMusic(['artist-1'])).resolves.toBe(0);

    expect(db.query).not.toHaveBeenCalled();
    expect(appleMusic.searchArtists).not.toHaveBeenCalled();
  });
});

describe('saveAppleMusic', () => {
  beforeEach(resetMocks);

  it('replaces the genres of data an artist has, keeping what the form left out', async () => {
    tx.findOne.mockResolvedValue({ id: 'data-1', artistId: 'artist-1' });

    await saveAppleMusic('artist-1', { genreNames: ['Indie'] });

    expect(tx.update).not.toHaveBeenCalled();
    expect(tx.deleteMany).toHaveBeenCalledExactlyOnceWith(appleMusicGenres, {
      where: { appleMusicDataId: 'data-1' },
    });
    expect(tx.createMany).toHaveBeenCalledExactlyOnceWith(appleMusicGenres, [
      { id: 'new-id', appleMusicDataId: 'data-1', name: 'Indie' },
    ]);
  });

  it('updates the ID and URL it was given', async () => {
    tx.findOne.mockResolvedValue({ id: 'data-1', artistId: 'artist-1' });

    await saveAppleMusic('artist-1', { id: '9', url: null });

    expect(tx.update).toHaveBeenCalledExactlyOnceWith(appleMusicData, 'data-1', {
      appleId: '9',
      url: null,
    });
  });
});

describe('fillAppleMusicLater', () => {
  beforeEach(resetMocks);

  it('logs a failure instead of rejecting, since nothing waits for it', async () => {
    query.all.mockRejectedValue(new Error('database unavailable'));

    fillAppleMusicLater(['artist-1']);

    await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());
  });
});
