export function loader() {
  throw new Response(null, {
    status: 404,
    statusText: 'Yikes! Not Found!',
  });
}

export default function NotFound() {
  return null;
}
