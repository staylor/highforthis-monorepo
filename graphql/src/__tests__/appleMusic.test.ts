import { generateKeyPairSync } from 'node:crypto';

import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { developerToken, searchAlbums } from '#/appleMusic';
import env from '#/env';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const { APPLE_MUSIC_KEY_ID, APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_PRIVATE_KEY } = env;

function album(id: string, name: string, artwork?: object) {
  return {
    id,
    type: 'albums',
    attributes: {
      name,
      artistName: 'LCD Soundsystem',
      releaseDate: '2007-03-12',
      url: `https://music.apple.com/us/album/${id}`,
      artwork,
    },
  };
}

describe('appleMusic', () => {
  beforeEach(() => {
    env.APPLE_MUSIC_KEY_ID = 'KEY123';
    env.APPLE_MUSIC_TEAM_ID = 'TEAM456';
    // The way an env file holds it, with its line breaks escaped
    env.APPLE_MUSIC_PRIVATE_KEY = privateKey
      .export({ type: 'pkcs8', format: 'pem' })
      .toString()
      .replace(/\n/g, '\\n');
  });

  afterEach(() => {
    Object.assign(env, { APPLE_MUSIC_KEY_ID, APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_PRIVATE_KEY });
    vi.unstubAllGlobals();
  });

  it('signs developer tokens the way Apple requires', () => {
    const token = jwt.verify(developerToken(), publicKey.export({ type: 'spki', format: 'pem' }), {
      algorithms: ['ES256'],
      complete: true,
    });

    expect(token.header).toMatchObject({ alg: 'ES256', kid: 'KEY123' });
    expect(token.payload).toMatchObject({ iss: 'TEAM456' });
  });

  it('says what to set when the key is missing', () => {
    env.APPLE_MUSIC_PRIVATE_KEY = undefined;

    expect(() => developerToken()).toThrow('APPLE_MUSIC_PRIVATE_KEY');
  });

  it('searches albums, leaving out any without artwork', async () => {
    const artwork = {
      width: 1500,
      height: 1500,
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music/{w}x{h}bb.jpg',
    };
    const requests: Request[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: URL, init: RequestInit) => {
        requests.push(new Request(url, init));
        return Response.json({
          results: {
            albums: {
              data: [album('742432549', 'Sound of Silver', artwork), album('1', 'No Cover')],
            },
          },
        });
      })
    );

    await expect(searchAlbums('sound of silver')).resolves.toEqual([
      {
        id: '742432549',
        name: 'Sound of Silver',
        artistName: 'LCD Soundsystem',
        releaseDate: '2007-03-12',
        url: 'https://music.apple.com/us/album/742432549',
        artwork,
      },
    ]);
    expect(new URL(requests[0].url).searchParams.get('types')).toBe('albums');
    expect(requests[0].headers.get('authorization')).toMatch(/^Bearer /);
  });
});
