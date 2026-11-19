import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import type { Middleware } from 'remix/router';
import { z } from 'zod';

import { isAdmin } from '#/authorization';
import prisma from '#/database';
import env from '#/env';
import { AuthUser } from '#/http';
import type { UserWithRoles } from '#/models';

type JWTPayload = {
  userId: string;
};

export function issueToken(userId: string): string {
  return jsonwebtoken.sign({ userId }, env.TOKEN_SECRET, { expiresIn: '12h' });
}

const authBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

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
      return user;
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

export async function authHandler({ body }: { body: unknown }): Promise<Response> {
  try {
    if (!env.PASSWORD_LOGIN_ENABLED) {
      return Response.json({ error: 'Password login is disabled' }, { status: 403 });
    }

    const { email, password } = authBodySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      throw new Error('User not found matching email/password combination');
    }

    return Response.json({ token: issueToken(user.id) });
  } catch (e) {
    return Response.json({ error: (e as Error).message });
  }
}
