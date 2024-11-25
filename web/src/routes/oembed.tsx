import type { Route } from './+types/oembed';

export async function loader({ request }: Route.LoaderArgs) {
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
  return data;
}
