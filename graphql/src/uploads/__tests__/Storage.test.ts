import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { storeFile } from '../Storage';
import Image from '../types/Image';

const { findUnique, findMany } = vi.hoisted(() => ({ findUnique: vi.fn(), findMany: vi.fn() }));

vi.mock('#/database', () => ({
  default: { mediaSettings: { findUnique }, mediaCropSetting: { findMany } },
}));

const imageFile = (buffer: Buffer) =>
  new File([new Uint8Array(buffer)], 'cover.jpg', { type: 'image/jpeg' });

const jpeg = () =>
  sharp({ create: { width: 4, height: 4, channels: 3, background: '#000' } })
    .jpeg()
    .toBuffer();

describe('storeFile', () => {
  let uploadDir: string;

  beforeEach(async () => {
    uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uploads-'));
    findUnique.mockResolvedValue({ id: 'media' });
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
});
