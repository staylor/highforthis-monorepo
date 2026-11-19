import { createCookie } from 'remix/cookie';

// The admin's GraphQL token lives in a signed cookie as `{ token }` JSON, signed with
// HMAC-SHA256 as React Router's session cookies were. Public pages read it to know someone is
// signed in, which turns on live refresh.

// Signing in lasts 12 hours
const maxAge = 12 * 60 * 60;

// Made when used, since the name, secret and NODE_ENV come from the environment
function sessionCookie() {
  return createCookie(process.env.TOKEN_KEY || '__session', {
    secrets: [process.env.TOKEN_SECRET || 's3cr3t'],
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  });
}

export function adminSessionCookie(token: string): Promise<string> {
  return sessionCookie().serialize(JSON.stringify({ token }));
}

/** Signs the admin out; the attributes must match the ones the cookie was set with. */
export function expiredAdminCookie(): Promise<string> {
  return sessionCookie().serialize('', { maxAge: 0 });
}

/** The signed-in admin's token from the request's cookies, or null. */
export async function adminToken(cookieHeader: string | null): Promise<string | null> {
  const value = await sessionCookie().parse(cookieHeader);
  try {
    const data = value ? JSON.parse(value) : null;
    return typeof data?.token === 'string' ? data.token : null;
  } catch {
    return null;
  }
}
