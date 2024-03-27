import type { LoaderFunction } from '@remix-run/server-runtime';

export const loader: LoaderFunction = () => {
  throw new Response(null, {
    status: 404,
    statusText: 'Yikes! Not Found!',
  });
};

export default function NotFound() {
  return null;
}
