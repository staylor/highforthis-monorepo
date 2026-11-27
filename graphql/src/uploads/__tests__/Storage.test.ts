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
      mimeType: 'image/jpeg',
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

  // Phones save photos sideways, with EXIF saying which way is up
  it('stores a sideways photo the right way up, without its metadata', async () => {
    findMany.mockResolvedValue([{ width: 100, height: null }]);
    const photo = await sharp({
      create: { width: 400, height: 200, channels: 3, background: '#c33' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const stored = await storeFile(imageFile(photo), uploadDir);

    expect(stored).toMatchObject({ width: 200, height: 400, crops: [{ width: 100, height: 200 }] });
    const folder = path.join(uploadDir, stored.destination);
    const saved = await sharp(path.join(folder, stored.fileName)).metadata();
    expect(saved).toMatchObject({ width: 200, height: 400 });
    expect(saved.orientation).toBeUndefined();
    expect(saved.exif).toBeUndefined();
    await expect(
      sharp(path.join(folder, stored.crops?.[0].fileName ?? '')).metadata()
    ).resolves.toMatchObject({ width: 100, height: 200 });
  });

  it('stores an image without metadata as it was uploaded', async () => {
    const upload = await sharp({
      create: { width: 64, height: 48, channels: 3, background: '#39c' },
    })
      .jpeg({ quality: 100 })
      .toBuffer();

    const stored = await storeFile(imageFile(upload), uploadDir);

    expect(stored).toMatchObject({ width: 64, height: 48, fileSize: upload.length });
    await expect(
      fs.readFile(path.join(uploadDir, stored.destination, stored.fileName))
    ).resolves.toEqual(upload);
  });

  it('keeps every frame of an animated GIF, in the image and in its crops', async () => {
    findMany.mockResolvedValue([{ width: 30, height: 30 }]);
    const frames = await Promise.all(
      ['#f00', '#0f0', '#00f'].map((background) =>
        sharp({ create: { width: 60, height: 40, channels: 3, background } })
          .png()
          .toBuffer()
      )
    );
    const gif = await sharp(frames, { join: { animated: true } })
      .gif()
      .toBuffer();

    const stored = await storeFile(
      new File([new Uint8Array(gif)], 'dance.gif', { type: 'image/gif' }),
      uploadDir
    );

    expect(stored).toMatchObject({ width: 60, height: 40, crops: [{ width: 30, height: 30 }] });
    const folder = path.join(uploadDir, stored.destination);
    await expect(fs.readFile(path.join(folder, stored.fileName))).resolves.toEqual(gif);
    await expect(
      sharp(path.join(folder, stored.crops?.[0].fileName ?? '')).metadata()
    ).resolves.toMatchObject({ pages: 3, width: 30, height: 30 });
  });

  it('turns down an image that stops partway, and removes what it wrote', async () => {
    const photo = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: '#000',
        noise: { type: 'gaussian', mean: 128, sigma: 30 },
      },
    })
      .jpeg()
      .toBuffer();

    await expect(
      storeFile(imageFile(photo.subarray(0, photo.length / 2)), uploadDir)
    ).rejects.toThrow('not an image that can be read');
    await expect(filesIn(uploadDir)).resolves.toEqual([]);
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

  it.each([
    ['audio/mp3', 'audio/mpeg', '.mp3'],
    ['audio/x-m4a', 'audio/mp4', '.m4a'],
    ['audio/x-wav', 'audio/wav', '.wav'],
  ])('records audio a browser calls %s as %s', async (given, standard, extension) => {
    const stored = await storeFile(await fixture('tone.mp3', given), uploadDir);

    expect(stored).toMatchObject({ type: 'audio', mimeType: standard });
    expect(path.extname(stored.fileName)).toBe(extension);
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
