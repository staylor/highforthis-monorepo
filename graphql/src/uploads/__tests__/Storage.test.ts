import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { storeFile } from '../Storage';
import type { StorageAdapter } from '../adapter';
import Image from '../types/Image';

const findMany = vi.hoisted(() => vi.fn());

vi.mock('#/database/db', () => ({ default: { findMany } }));

const imageFile = (buffer: Buffer) =>
  new File([new Uint8Array(buffer)], 'cover.jpg', { type: 'image/jpeg' });

const jpeg = () =>
  sharp({ create: { width: 4, height: 4, channels: 3, background: '#000' } })
    .jpeg()
    .toBuffer();

// Made with ffmpeg: a second of a sine tone with tags, and of its test pattern at 64x48
const fixture = async (name: string, type: string) =>
  new File([await fs.readFile(new URL(`./fixtures/${name}`, import.meta.url))], name, { type });

/** A bucket that takes the files it's given, or fails with `error`, and says which were there */
function bucket(error?: Error) {
  const copied: string[] = [];
  const run = async (files: { destination: string; fileName: string }[]) => {
    for (const { destination, fileName } of files) {
      await fs.access(path.join(destination, fileName));
      copied.push(fileName);
    }
    if (error) {
      throw error;
    }
    return files.map(() => true);
  };
  return { copied, adapter: { run } as unknown as StorageAdapter };
}

const filesIn = async (dir: string) =>
  (await fs.readdir(dir, { recursive: true, withFileTypes: true })).filter((entry) =>
    entry.isFile()
  );

describe('storeFile', () => {
  let uploadDir: string;

  beforeEach(async () => {
    uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uploads-'));
    findMany.mockResolvedValue([{ width: 150, height: 150 }]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(uploadDir, { recursive: true, force: true });
  });

  it('stores a readable image with its crops', async () => {
    const stored = await storeFile(imageFile(await jpeg()), uploadDir);

    expect(stored).toMatchObject({
      width: 4,
      height: 4,
      type: 'image',
      crops: [{ width: 4, height: 4 }],
    });
    await expect(
      fs.access(path.join(uploadDir, stored.destination, stored.fileName))
    ).resolves.toBeUndefined();
  });

  it('turns down a file that is not an image, and removes what it wrote', async () => {
    await expect(storeFile(imageFile(Buffer.from('not an image')), uploadDir)).rejects.toThrow(
      'not an image that can be read'
    );
    const written = await fs.readdir(uploadDir, { recursive: true, withFileTypes: true });
    expect(written.filter((entry) => entry.isFile())).toEqual([]);
  });

  it('rejects when a crop fails', async () => {
    vi.spyOn(Image.prototype, 'handleCrop').mockRejectedValue(new Error('crop failed'));

    await expect(storeFile(imageFile(await jpeg()), uploadDir)).rejects.toThrow('crop failed');
  });

  it("reads an audio file's tags and length, and stores its cover", async () => {
    const stored = await storeFile(await fixture('tone.mp3', 'audio/mpeg'), uploadDir);

    expect(stored).toMatchObject({
      type: 'audio',
      title: 'Test Tone',
      artist: ['The Testers'],
      albumArtist: ['Various'],
      album: 'Fixtures',
      genre: ['Electronic'],
      year: 2024,
      images: [
        { fileName: expect.stringMatching(/^[0-9a-f]{16}-cover-0\.jpg$/), width: 64, height: 64 },
      ],
    });
    expect(stored.duration).toBeCloseTo(1.04, 1);
    await expect(
      fs.access(path.join(uploadDir, stored.destination, stored.images?.[0].fileName ?? ''))
    ).resolves.toBeUndefined();
  });

  it('reads the tags of an Ogg file', async () => {
    const stored = await storeFile(await fixture('tone.ogg', 'audio/ogg'), uploadDir);

    expect(stored).toMatchObject({
      type: 'audio',
      title: 'Test Tone',
      artist: ['The Testers'],
      album: 'Fixtures',
      year: 2024,
      duration: 1,
    });
  });

  it.each([
    ['clip.mp4', 'video/mp4'],
    ['clip.webm', 'video/webm'],
  ])("reads a video's size and length from %s", async (name, type) => {
    const stored = await storeFile(await fixture(name, type), uploadDir);

    expect(stored).toMatchObject({ type: 'video', width: 64, height: 48, duration: 1 });
  });

  it('stores audio and video whose details cannot be read, without them', async () => {
    const audio = await storeFile(
      new File(['not audio'], 'song.mp3', { type: 'audio/mpeg' }),
      uploadDir
    );
    const video = await storeFile(
      new File(['not video'], 'clip.mp4', { type: 'video/mp4' }),
      uploadDir
    );

    expect(audio).toMatchObject({ type: 'audio', title: '', artist: [], fileSize: 9 });
    expect(audio.duration).toBeUndefined();
    expect(video).toMatchObject({ type: 'video', fileSize: 9 });
    expect(video.width).toBeUndefined();
  });

  it('copies an image and its crops to the bucket, then removes them from the upload folder', async () => {
    const { adapter, copied } = bucket();

    const stored = await storeFile(imageFile(await jpeg()), uploadDir, adapter);

    expect(copied).toEqual([stored.fileName, ...(stored.crops ?? []).map((crop) => crop.fileName)]);
    expect(copied).toHaveLength(2);
    await expect(filesIn(uploadDir)).resolves.toEqual([]);
  });

  it('removes them when the bucket cannot be reached, too', async () => {
    const { adapter } = bucket(new Error('bucket unavailable'));

    await expect(storeFile(imageFile(await jpeg()), uploadDir, adapter)).rejects.toThrow(
      'bucket unavailable'
    );
    await expect(filesIn(uploadDir)).resolves.toEqual([]);
  });

  it.each(['image/jpeg', 'audio/mpeg', 'video/mp4'])(
    'rejects when a %s file has nowhere to be written',
    async (type) => {
      // A folder can't be made inside a file
      const blocked = path.join(uploadDir, 'blocked');
      await fs.writeFile(blocked, '');

      await expect(
        storeFile(new File(['contents'], 'upload', { type }), blocked, bucket().adapter)
      ).rejects.toThrow(/ENOTDIR|EEXIST/);
    }
  );
});
