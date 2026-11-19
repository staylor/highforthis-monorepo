import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import handleUploads from '../handler';

const { db, run } = vi.hoisted(() => ({
  db: {
    mediaSettings: { findUnique: vi.fn() },
    mediaCropSetting: { findMany: vi.fn() },
    mediaUpload: { create: vi.fn() },
  },
  run: vi.fn(),
}));

vi.mock('#/database', () => ({ default: db }));
vi.mock('../adapter', () => ({ default: () => ({ run }) }));

const upload = (...files: [string, File][]) => {
  const body = new FormData();
  for (const [field, file] of files) {
    body.append(field, file);
  }
  return new Request('http://localhost/upload', { method: 'POST', body });
};
const text = (name: string, contents: string) => new File([contents], name, { type: 'text/plain' });

describe('handleUploads', () => {
  let uploadDir: string;

  beforeEach(async () => {
    uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uploads-'));
    db.mediaSettings.findUnique.mockResolvedValue(null);
    let id = 0;
    db.mediaUpload.create.mockImplementation(async () => ({ id: `media-${++id}` }));
    run.mockResolvedValue([]);
  });

  afterEach(async () => {
    vi.resetAllMocks();
    await fs.rm(uploadDir, { recursive: true, force: true });
  });

  it('stores each file, copies it to the bucket, and answers the media IDs in order', async () => {
    const response = await handleUploads(
      upload(['uploads', text('one.txt', 'first')], ['uploads', text('two.txt', 'second')]),
      uploadDir
    );

    expect(await response.json()).toEqual(['media-1', 'media-2']);
    const records = db.mediaUpload.create.mock.calls.map(([{ data }]) => data);
    expect(records).toEqual([
      expect.objectContaining({ originalName: 'one.txt', mimeType: 'text/plain', fileSize: 5 }),
      expect.objectContaining({ originalName: 'two.txt', mimeType: 'text/plain', fileSize: 6 }),
    ]);
    const stored = await fs.readFile(
      path.join(uploadDir, records[1].destination, records[1].fileName),
      'utf8'
    );
    expect(stored).toBe('second');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('takes files over 2 MB', async () => {
    const response = await handleUploads(
      upload(['uploads', text('big.txt', 'x'.repeat(3 * 1024 * 1024))]),
      uploadDir
    );

    expect(await response.json()).toEqual(['media-1']);
  });

  it('streams the next file in while the last one is copied to the bucket', async () => {
    // The first copy finishes only once the second has started
    const { promise: secondCopy, resolve } = Promise.withResolvers<[]>();
    run.mockReturnValueOnce(secondCopy).mockImplementationOnce(async () => {
      resolve([]);
      return [];
    });

    const response = await handleUploads(
      upload(['uploads', text('one.txt', 'first')], ['uploads', text('two.txt', 'second')]),
      uploadDir
    );

    expect(await response.json()).toEqual(['media-1', 'media-2']);
  });

  it('rejects a file in another field', async () => {
    await expect(
      handleUploads(upload(['avatar', text('one.txt', 'first')]), uploadDir)
    ).rejects.toThrow('Unexpected field: avatar');
    expect(db.mediaUpload.create).not.toHaveBeenCalled();
  });

  it('rejects when a file fails to store, once the others are done', async () => {
    run.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('bucket unavailable'));

    await expect(
      handleUploads(
        upload(['uploads', text('one.txt', 'first')], ['uploads', text('two.txt', 'second')]),
        uploadDir
      )
    ).rejects.toThrow('bucket unavailable');
    expect(db.mediaUpload.create).not.toHaveBeenCalled();
  });

  it('answers no files for a body that is not multipart', async () => {
    const request = new Request('http://localhost/upload', {
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(await (await handleUploads(request, uploadDir)).json()).toEqual([]);
  });
});
