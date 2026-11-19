import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import type { Middleware } from 'remix/router';
import { z } from 'zod';

import { createRateLimiter } from '@highforthis/shared/rate-limit';

import { isAdmin } from '#/authorization';
import prisma from '#/database';
import env from '#/env';
import { AuthUser } from '#/http';
import type { UserWithRoles } from '#/models';

type JWTPayload = {
  userId: string;
  // The user's token version when the token was issued; tokens from before this existed have none
  ver?: number;
};

/** A token for the user that lasts 12 hours, or until they sign out or change their password. */
export function issueToken(user: { id: string; tokenVersion: number }): string {
  return jsonwebtoken.sign({ userId: user.id, ver: user.tokenVersion }, env.TOKEN_SECRET, {
    expiresIn: '12h',
  });
}

const authBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

// Compared against when no user has the email, so an unknown email takes as long as a wrong password
const UNKNOWN_USER_HASH = '$2b$10$UB2COKhs.EjDJdDhQtWeAuESCXrYjeG1omp5MA/WQvUjOHq7XmL9C';

// Failed sign-ins per email: 5 in 15 minutes, wherever they come from
const failedSignIns = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

function extractBearerToken(headers: Headers): string | null {
  const header = headers.get('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

async function tokenUser(headers: Headers): Promise<UserWithRoles | null> {
  const token = extractBearerToken(headers);
  if (!token) {
    return null;
  }

  try {
    const payload = jsonwebtoken.verify(token, env.TOKEN_SECRET) as JWTPayload;
    if (payload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { roles: true },
      });
      // Signing out or changing the password moves the version on, which ends older tokens
      return user && (payload.ver ?? 0) === user.tokenVersion ? user : null;
    }
  } catch {
    // Invalid or expired token — continue as unauthenticated
  }
  return null;
}

/** Puts the user the request's bearer token belongs to, if any, on `context.authUser`. */
export function jwt(): Middleware<{
  key: typeof AuthUser;
  value: UserWithRoles | null;
  property: 'authUser';
}> {
  return async (context, next) => {
    context.set(AuthUser, await tokenUser(context.headers), { property: 'authUser' });
    return next();
  };
}

export function sessionHandler({ authUser }: { authUser: UserWithRoles | null }): Response {
  if (!isAdmin(authUser)) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  return Response.json({ user: { id: authUser.id, email: authUser.email, name: authUser.name } });
}

/** `POST /auth/signout`: ends every token the signed-in user has. */
export async function signOutHandler({
  authUser,
}: {
  authUser: UserWithRoles | null;
}): Promise<Response> {
  if (!authUser) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }
  await prisma.user.update({
    where: { id: authUser.id },
    data: { tokenVersion: { increment: 1 } },
  });
  return new Response(null, { status: 204 });
}

/**
 * `POST /auth`: a token for the right email and password. Every failure gets the same answer and
 * takes about as long, and an email with too many failures is turned away for a while.
 */
export async function authHandler({ body }: { body: unknown }): Promise<Response> {
  if (!env.PASSWORD_LOGIN_ENABLED) {
    return Response.json({ error: 'Password login is disabled' }, { status: 403 });
  }

  const parsed = authBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const key = email.trim().toLowerCase();
  if (failedSignIns.isLimited(key)) {
    return Response.json(
      { error: 'Too many failed sign-ins. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(failedSignIns.retryAfter(key)) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const matches = await bcrypt.compare(password, user?.hash ?? UNKNOWN_USER_HASH);
  if (!user || !matches) {
    failedSignIns.attempt(key);
    return Response.json({ error: 'Wrong email or password' }, { status: 401 });
  }

  failedSignIns.reset(key);
  return Response.json({ token: issueToken(user) });
}
