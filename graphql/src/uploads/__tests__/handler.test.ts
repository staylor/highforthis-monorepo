import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import handleUploads from '../handler';

const { db, newId, run } = vi.hoisted(() => ({
  db: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), transaction: vi.fn() },
  newId: vi.fn(),
  run: vi.fn(),
}));

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('#/database/tables', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/database/tables')>()),
  newId,
}));
vi.mock('../adapter', () => ({ default: () => ({ run }) }));

const upload = (...files: [string, File][]) => {
  const body = new FormData();
  for (const [field, file] of files) {
    body.append(field, file);
  }
  return new Request('http://localhost/upload', { method: 'POST', body });
};
// Audio whose metadata can't be read is still stored, so text stands in for it
const audio = (name: string, contents: string, type = 'audio/mpeg') =>
  new File([contents], name, { type });

/** The files left in the upload folder */
const filesIn = async (dir: string) =>
  (await fs.readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

describe('handleUploads', () => {
  let uploadDir: string;

  beforeEach(async () => {
    uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uploads-'));
    db.findMany.mockResolvedValue([]);
    db.transaction.mockImplementation((save: (tx: typeof db) => unknown) => save(db));
    let id = 0;
    newId.mockImplementation(() => `media-${++id}`);
    run.mockResolvedValue([]);
  });

  afterEach(async () => {
    vi.resetAllMocks();
    await fs.rm(uploadDir, { recursive: true, force: true });
  });

  it('stores each file, copies it to the bucket, and answers the media IDs in order', async () => {
    // What each file held when the bucket got it
    const copied = new Map<string, string>();
    run.mockImplementation(async ([{ destination, fileName }]) => {
      copied.set(fileName, await fs.readFile(path.join(destination, fileName), 'utf8'));
      return [];
    });

    const response = await handleUploads(
      upload(['uploads', audio('one.txt', 'first')], ['uploads', audio('two.txt', 'second')]),
      uploadDir
    );

    await expect(response.json()).resolves.toEqual(['media-1', 'media-2']);
    const records = db.create.mock.calls.map(([, data]) => data);
    expect(records).toEqual([
      expect.objectContaining({ originalName: 'one.txt', mimeType: 'audio/mpeg', fileSize: 5 }),
      expect.objectContaining({ originalName: 'two.txt', mimeType: 'audio/mpeg', fileSize: 6 }),
    ]);
    expect(records.map(({ fileName }) => copied.get(fileName))).toEqual(['first', 'second']);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('keeps no copy of a file once the bucket has it', async () => {
    await handleUploads(upload(['uploads', audio('one.txt', 'first')]), uploadDir);

    await expect(filesIn(uploadDir)).resolves.toEqual([]);
  });

  it('takes files over 2 MB', async () => {
    const response = await handleUploads(
      upload(['uploads', audio('big.txt', 'x'.repeat(3 * 1024 * 1024))]),
      uploadDir
    );

    await expect(response.json()).resolves.toEqual(['media-1']);
  });

  it('streams the next file in while the last one is copied to the bucket', async () => {
    // The first copy finishes only once the second has started
    const { promise: secondCopy, resolve } = Promise.withResolvers<[]>();
    run.mockReturnValueOnce(secondCopy).mockImplementationOnce(async () => {
      resolve([]);
      return [];
    });

    const response = await handleUploads(
      upload(['uploads', audio('one.txt', 'first')], ['uploads', audio('two.txt', 'second')]),
      uploadDir
    );

    await expect(response.json()).resolves.toEqual(['media-1', 'media-2']);
  });

  it('refuses a file in another field', async () => {
    const response = await handleUploads(upload(['avatar', audio('one.txt', 'first')]), uploadDir);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Unexpected field: avatar' });
    expect(db.create).not.toHaveBeenCalled();
  });

  it('refuses a file that is not an image, audio or video, without storing it', async () => {
    for (const type of ['text/html', 'image/svg+xml', 'application/octet-stream', '']) {
      const response = await handleUploads(
        upload(['uploads', audio('page.html', '<script>alert(1)</script>', type)]),
        uploadDir
      );

      expect(response.status, type).toBe(415);
    }
    expect(db.create).not.toHaveBeenCalled();
    await expect(fs.readdir(uploadDir)).resolves.toEqual([]);
  });

  it("stores a file under its type's extension, whatever its name says", async () => {
    await handleUploads(upload(['uploads', audio('song.html', 'first')]), uploadDir);

    const [[, data]] = db.create.mock.calls;
    expect(data).toEqual(
      expect.objectContaining({
        originalName: 'song.html',
        fileName: expect.stringMatching(/^[0-9a-f]{16}\.mp3$/),
      })
    );
  });

  it('refuses a file labelled as an image that is not one', async () => {
    const response = await handleUploads(
      upload(['uploads', audio('page.png', '<script>alert(1)</script>', 'image/png')]),
      uploadDir
    );

    expect(response.status).toBe(415);
    expect(db.create).not.toHaveBeenCalled();
  });

  it('refuses more than 10 files in a request', async () => {
    const files = Array.from({ length: 11 }, (_, i): [string, File] => [
      'uploads',
      audio(`${i}.mp3`, 'x'),
    ]);

    const response = await handleUploads(upload(...files), uploadDir);

    expect(response.status).toBe(413);
    expect(db.create).not.toHaveBeenCalled();
  });

  it('rejects when a file fails to store, once the others are done', async () => {
    run.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('bucket unavailable'));

    await expect(
      handleUploads(
        upload(['uploads', audio('one.txt', 'first')], ['uploads', audio('two.txt', 'second')]),
        uploadDir
      )
    ).rejects.toThrow('bucket unavailable');
    expect(db.create).not.toHaveBeenCalled();
    await expect(filesIn(uploadDir)).resolves.toEqual([]);
  });

  it('answers no files for a body that is not multipart', async () => {
    const request = new Request('http://localhost/upload', {
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
    });

    await expect((await handleUploads(request, uploadDir)).json()).resolves.toEqual([]);
  });
});
