import type { LoaderFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';

export const loader: LoaderFunction = async ({ request }) => {
  const requested = new URL(request.url);
  if (!requested) {
    return null;
  }
  const provider = requested.searchParams.get('provider');
  const url = requested.searchParams.get('url');
  if (!(provider && url)) {
    return null;
  }

  const oembedUrl = new URL(provider);
  oembedUrl.searchParams.set('url', url);
  const data = await fetch(oembedUrl.toString()).then((response) => response.json());
  return json(data);
};
