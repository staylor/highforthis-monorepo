import { createHmac, timingSafeEqual } from 'node:crypto';

// The admin app (React Router) signs people in and keeps their token in a signed cookie
// session. Public pages read it to know someone is signed in, which turns on live refresh, and
// admin pages served here read the token to call GraphQL. React Router signs `base64(JSON)` with
// HMAC-SHA256 and appends the signature, unpadded base64, after a dot.

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

function verify(signed: string): string | null {
  const dot = signed.lastIndexOf('.');
  if (dot < 0) {
    return null;
  }
  const value = signed.slice(0, dot);
  const signature = Buffer.from(signed.slice(dot + 1));
  for (const secret of secrets()) {
    const expected = Buffer.from(
      createHmac('sha256', secret).update(value).digest('base64').replace(/=+$/, '')
    );
    if (expected.length === signature.length && timingSafeEqual(expected, signature)) {
      return value;
    }
  }
  return null;
}

/** A `Set-Cookie` value that removes the admin session, with the attributes the admin sets. */
export function expiredAdminCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${cookieName()}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
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
