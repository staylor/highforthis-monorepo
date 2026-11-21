import { createCookie } from 'remix/cookie';

// The admin's GraphQL token lives in a signed cookie as `{ token }` JSON, signed with
// HMAC-SHA256 as React Router's session cookies were. Public pages read it to know someone is
// signed in, and then aren't cached, so an admin sees their edits right away.

// Signing in lasts 12 hours
const maxAge = 12 * 60 * 60;

// Development and tests sign with this when TOKEN_SECRET isn't set. A deployed server won't
// start without one (see assertSessionSecret).
const developmentSecret = 's3cr3t';

/** Production, or anywhere on Railway, whatever NODE_ENV says. */
function deployed(env: NodeJS.ProcessEnv) {
  return env.NODE_ENV === 'production' || Boolean(env.RAILWAY_ENVIRONMENT_NAME);
}

/**
 * Throws when a deployed server has no TOKEN_SECRET, so the session cookie is never signed with
 * the development secret, which anyone can read here.
 */
export function assertSessionSecret(env: NodeJS.ProcessEnv = process.env): void {
  if (deployed(env) && !env.TOKEN_SECRET) {
    throw new Error('Set TOKEN_SECRET: it signs the admin session cookie');
  }
}

// Made when used, since the name, secret and NODE_ENV come from the environment
function sessionCookie() {
  return createCookie(process.env.TOKEN_KEY || '__session', {
    secrets: [process.env.TOKEN_SECRET || developmentSecret],
    httpOnly: true,
    secure: deployed(process.env),
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
