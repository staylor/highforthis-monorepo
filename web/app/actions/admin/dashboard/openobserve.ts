// Queries OpenObserve's search API from the server with the credentials the telemetry exporters
// use, so they never reach the browser.

interface OpenObserveConfig {
  url: string;
  organization: string;
  authorization: string;
}

export function openObserveConfig(env = process.env): OpenObserveConfig | null {
  const { OPENOBSERVE_URL: url, OPENOBSERVE_USER: user, OPENOBSERVE_PASSWORD: password } = env;
  if (!url || !user || !password) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    organization: env.OPENOBSERVE_ORG || 'default',
    authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
  };
}

export async function search<T>(
  config: OpenObserveConfig,
  sql: string,
  { start, end, size = 1000 }: { start: Date; end: Date; size?: number }
): Promise<T[]> {
  const response = await fetch(`${config.url}/api/${config.organization}/_search`, {
    method: 'POST',
    headers: { Authorization: config.authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // OpenObserve takes microseconds
      query: {
        sql,
        start_time: start.getTime() * 1000,
        end_time: end.getTime() * 1000,
        from: 0,
        size,
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`OpenObserve search failed with ${response.status}: ${await response.text()}`);
  }

  const body = (await response.json()) as { hits?: T[] };
  return body.hits ?? [];
}
