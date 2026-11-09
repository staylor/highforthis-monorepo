const USER_AGENT = 'HighForThis/1.0 (+https://highforthis.com)';

const entries = new Map<string, { expires: number; value: Promise<unknown> }>();

// Memoizes a load for ttlMs. Failures aren't cached, so the next request retries.
export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = entries.get(key);
  if (hit && hit.expires > now) {
    return hit.value as Promise<T>;
  }

  const value = load();
  entries.set(key, { expires: now + ttlMs, value });
  value.catch(() => {
    if (entries.get(key)?.value === value) {
      entries.delete(key);
    }
  });
  return value;
}

export async function fetchText(url: string, source: string) {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(`${source} didn't respond (${(error as Error).message}).`);
  }
  if (!response.ok) {
    throw new Error(`${source} returned HTTP ${response.status}.`);
  }
  return response.text();
}
