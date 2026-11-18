import { redirect, type RouterContextProvider } from 'react-router';

import { isAuthenticated } from '#/auth';
import { graphqlHostContext } from '#/context';
import { sessionStorage } from '#/session';

// Throws a redirect to the login page unless the request carries a valid admin session.
// The admin layout runs it, and so does any loader that reads data without going through
// GraphQL's own checks, since a .data request can run one route's loader on its own.
export async function requireAdminSession({
  request,
  context,
}: {
  request: Request;
  context: Readonly<RouterContextProvider>;
}): Promise<void> {
  const token = await isAuthenticated(request);
  if (!token) {
    throw redirect('/login/unauthorized');
  }

  const response = await fetch(`${context.get(graphqlHostContext)}/auth/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    return;
  }
  if (response.status !== 401 && response.status !== 403) {
    throw new Response('Unable to validate the admin session', { status: 503 });
  }

  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  throw redirect('/login/unauthorized', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
}
