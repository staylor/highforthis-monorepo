import type { ClientLoaderFunctionArgs } from '@remix-run/react';

export const ONE_MINUTE = 60 * 1000;

interface CacheWithExpiry {
  data: any;
  expiry: number;
}

type CacheEntries = Map<string, CacheWithExpiry>;

export const createClientCache = (maxAge?: number) => {
  const expiry = maxAge || ONE_MINUTE;
  const cache: CacheEntries = new Map();
  const clientLoader = async ({ serverLoader, params }: ClientLoaderFunctionArgs) => {
    const now = Date.now();
    const key = JSON.stringify(params);
    const cached = cache.get(key);
    if (cached && now < cached.expiry) {
      return cached.data;
    }
    const data = await serverLoader();
    const entry = {} as CacheWithExpiry;
    entry.data = data;
    entry.expiry = now + expiry;
    cache.set(key, entry);
    return data;
  };
  clientLoader.hydrate = true;
  return clientLoader;
};
