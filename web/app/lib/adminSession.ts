import { createHmac, timingSafeEqual } from 'node:crypto';

// Signing in keeps the admin's GraphQL token in a signed cookie. Public pages read it to know
// someone is signed in, which turns on live refresh, and admin pages read the token to call
// GraphQL. The format is the one the admin's React Router app used, so sessions it started keep
// working: `base64(JSON)`, signed with HMAC-SHA256, with the signature in unpadded base64 after a
// dot.

const cookieName = () => process.env.TOKEN_KEY || '__session';
const secrets = () => [process.env.TOKEN_SECRET || 's3cr3t'];

function cookieValue(cookieHeader: string | null, name: string): string | null {
  for (const part of cookieHeader?.split(';') ?? []) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

const sign = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('base64').replace(/=+$/, '');

function verify(signed: string): string | null {
  const dot = signed.lastIndexOf('.');
  if (dot < 0) {
    return null;
  }
  const value = signed.slice(0, dot);
  const signature = Buffer.from(signed.slice(dot + 1));
  for (const secret of secrets()) {
    const expected = Buffer.from(sign(value, secret));
    if (expected.length === signature.length && timingSafeEqual(expected, signature)) {
      return value;
    }
  }
  return null;
}

// Signing in lasts 12 hours
const maxAge = 12 * 60 * 60;

const attributes = (seconds: number) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `Path=/; Max-Age=${seconds}; HttpOnly; SameSite=Lax${secure}`;
};

/** A `Set-Cookie` value that signs the admin in with their GraphQL token. */
export function adminSessionCookie(token: string): string {
  const value = Buffer.from(JSON.stringify({ token })).toString('base64');
  const signed = `${value}.${sign(value, secrets()[0])}`;
  return `${cookieName()}=${encodeURIComponent(signed)}; ${attributes(maxAge)}`;
}

/** A `Set-Cookie` value that signs the admin out. */
export function expiredAdminCookie(): string {
  return `${cookieName()}=; ${attributes(0)}`;
}

/** The signed-in admin's token from the request's cookies, or null. */
export function adminToken(cookieHeader: string | null): string | null {
  const signed = cookieValue(cookieHeader, cookieName());
  const value = signed && verify(signed);
  if (!value) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
    return typeof data?.token === 'string' ? data.token : null;
  } catch {
    return null;
  }
}
