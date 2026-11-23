import jwt from 'jsonwebtoken';
import { z } from 'zod';

import env from '#/env';

const CATALOG = 'https://api.music.apple.com/v1/catalog/us';

const artworkSchema = z.object({
  width: z.number(),
  height: z.number(),
  url: z.string(),
  bgColor: z.string().optional(),
  textColor1: z.string().optional(),
  textColor2: z.string().optional(),
  textColor3: z.string().optional(),
  textColor4: z.string().optional(),
});

const albumSchema = z.object({
  id: z.string(),
  attributes: z.object({
    name: z.string(),
    artistName: z.string(),
    releaseDate: z.string().optional(),
    url: z.string().optional(),
    artwork: artworkSchema.optional(),
  }),
});

const searchSchema = z.object({
  results: z.object({ albums: z.object({ data: z.array(albumSchema) }).optional() }),
});

const albumsSchema = z.object({ data: z.array(albumSchema) });

const artistSchema = z.object({
  id: z.string(),
  attributes: z.object({
    name: z.string(),
    url: z.string().optional(),
    genreNames: z.array(z.string()).optional(),
    artwork: artworkSchema.optional(),
  }),
});

const artistSearchSchema = z.object({
  results: z.object({ artists: z.object({ data: z.array(artistSchema) }).optional() }),
});

type Artwork = z.infer<typeof artworkSchema>;

export interface Album {
  id: string;
  name: string;
  artistName: string;
  releaseDate: string | null;
  url: string | null;
  artwork: Artwork;
}

/** An artist in Apple Music's catalog */
export interface CatalogArtist {
  id: string;
  name: string;
  url: string | null;
  genreNames: string[];
  artwork: Artwork | null;
}

/** Whether the MusicKit key the Apple Music API needs is set */
export function hasAppleMusicKeys() {
  return Boolean(env.APPLE_MUSIC_KEY_ID && env.APPLE_MUSIC_TEAM_ID && env.APPLE_MUSIC_PRIVATE_KEY);
}

// A developer token for the Apple Music API, signed with a MusicKit private key
export function developerToken() {
  const {
    APPLE_MUSIC_KEY_ID: keyid,
    APPLE_MUSIC_TEAM_ID: issuer,
    APPLE_MUSIC_PRIVATE_KEY: privateKey,
  } = env;
  if (!keyid || !issuer || !privateKey) {
    throw new Error(
      'Set APPLE_MUSIC_KEY_ID, APPLE_MUSIC_TEAM_ID and APPLE_MUSIC_PRIVATE_KEY to search Apple Music.'
    );
  }
  // Env files hold the key's line breaks as \n
  return jwt.sign({}, privateKey.replace(/\\n/g, '\n'), {
    algorithm: 'ES256',
    expiresIn: '1h',
    issuer,
    keyid,
  });
}

async function catalog(path: string, params: Record<string, string>) {
  const url = new URL(`${CATALOG}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${developerToken()}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Apple Music returned HTTP ${response.status}.`);
  }
  return response.json();
}

// An album without artwork has no cover to add
function toAlbums(data: z.infer<typeof albumSchema>[]): Album[] {
  return data.flatMap(({ id, attributes: { artwork, releaseDate, url, ...rest } }) =>
    artwork ? [{ ...rest, id, releaseDate: releaseDate ?? null, url: url ?? null, artwork }] : []
  );
}

export async function searchAlbums(term: string) {
  const { results } = searchSchema.parse(
    await catalog('/search', { term, types: 'albums', limit: '25' })
  );
  return toAlbums(results.albums?.data ?? []);
}

/** The artists Apple Music finds for a name, the likeliest first */
export async function searchArtists(term: string): Promise<CatalogArtist[]> {
  const { results } = artistSearchSchema.parse(
    await catalog('/search', { term, types: 'artists', limit: '10' })
  );
  return (results.artists?.data ?? []).map(({ id, attributes }) => ({
    id,
    name: attributes.name,
    url: attributes.url ?? null,
    genreNames: attributes.genreNames ?? [],
    artwork: attributes.artwork ?? null,
  }));
}

export async function getAlbums(ids: string[]) {
  const { data } = albumsSchema.parse(await catalog('/albums', { ids: ids.join(',') }));
  return toAlbums(data);
}

// Artwork URLs are templates that take the size to download in place of {w} and {h}
export function artworkUrl({ url }: Artwork, width: number, height: number) {
  return url.replace('{w}', String(width)).replace('{h}', String(height));
}
