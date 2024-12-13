import { sessionStorage } from './session';

export async function isAuthenticated(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  return session && session.get('token');
}
