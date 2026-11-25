import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { ilike, lt } from 'remix/data-table';
import type { Middleware } from 'remix/router';
import { z } from 'zod';

import { createRateLimiter } from '@highforthis/shared/rate-limit';

import { isAdmin } from '#/authorization';
import db from '#/database/db';
import { matching } from '#/database/search';
import { newId, sessions, sessionUser, users } from '#/database/tables';
import env from '#/env';
import { AuthUser } from '#/http';
import type { UserWithRoles } from '#/models';

type JWTPayload = {
  userId: string;
  // The session the token belongs to. Tokens from before sessions were kept have none.
  sid?: string;
};

const SESSION_HOURS = 12;

/** Signs a token for a session that's already saved. */
export function signToken(userId: string, sessionId: string): string {
  return jsonwebtoken.sign({ userId, sid: sessionId }, env.TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${SESSION_HOURS}h`,
  });
}

/**
 * Starts a session for the user and answers its token, which lasts 12 hours, or until they sign
 * out or their password changes.
 */
export async function issueToken(userId: string): Promise<string> {
  const now = new Date();
  await db.deleteMany(sessions, { where: lt('expiresAt', now) });
  const id = newId();
  await db.create(sessions, {
    id,
    userId,
    expiresAt: new Date(now.getTime() + SESSION_HOURS * 60 * 60 * 1000),
  });
  return signToken(userId, id);
}

function verifiedPayload(token: string): JWTPayload | null {
  try {
    return jsonwebtoken.verify(token, env.TOKEN_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
  } catch {
    // Invalid or expired
    return null;
  }
}

const authBodySchema = z.object({
  // Without the spaces a keyboard's autocomplete can leave around it
  email: z.string().trim().min(1),
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
  const payload = token ? verifiedPayload(token) : null;
  // A token is good only while its session is: signing out or a new password deletes it
  if (!payload?.userId || !payload.sid) {
    return null;
  }
  const session = await db.find(sessions, payload.sid, { with: { user: sessionUser } });
  if (!session?.user || session.userId !== payload.userId || session.expiresAt <= new Date()) {
    return null;
  }
  return session.user;
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

/** `POST /auth/signout`: ends the session the request's token belongs to, and only that one. */
export async function signOutHandler({
  authUser,
  headers,
}: {
  authUser: UserWithRoles | null;
  headers: Headers;
}): Promise<Response> {
  const token = extractBearerToken(headers);
  const sessionId = token ? verifiedPayload(token)?.sid : undefined;
  if (!authUser || !sessionId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }
  await db.deleteMany(sessions, { where: { id: sessionId, userId: authUser.id } });
  return new Response(null, { status: 204 });
}

/** Ends all of the user's sessions, as a new password should. */
export async function endSessions(userId: string): Promise<void> {
  await db.deleteMany(sessions, { where: { userId } });
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

  // Failed sign-ins are counted by the email in lowercase
  const key = email.toLowerCase();
  if (failedSignIns.isLimited(key)) {
    return Response.json(
      { error: 'Too many failed sign-ins. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(failedSignIns.retryAfter(key)) } }
    );
  }

  // An email is a user's whatever its case, as mail is delivered. Postgres finds those, and also
  // takes a few letters for others, such as İ for i, where lowercase here keeps them apart. So the
  // email has to be the same in lowercase here too, which is what failures are counted by:
  // otherwise typing İ for i would get an email five more tries. No two users' emails differ only
  // in case (see User.ts), and the oldest account would win if they did.
  const found = await db.findMany(users, {
    where: ilike('email', matching(email)),
    orderBy: ['createdAt', 'asc'],
  });
  const user = found.find((candidate) => candidate.email.toLowerCase() === key);
  const matches = await bcrypt.compare(password, user?.hash ?? UNKNOWN_USER_HASH);
  if (!user || !matches) {
    failedSignIns.attempt(key);
    return Response.json({ error: 'Wrong email or password' }, { status: 401 });
  }

  failedSignIns.reset(key);
  return Response.json({ token: await issueToken(user.id) });
}
