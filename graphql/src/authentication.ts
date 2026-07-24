import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { z } from 'zod';

import prisma from '#/database';
import env from '#/env';
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

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export async function jwtMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = jsonwebtoken.verify(token, env.TOKEN_SECRET) as JWTPayload;
    if (payload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { roles: true },
      });
      if (user) {
        req.context.authUser = user;
      }
    }
  } catch {
    // Invalid or expired token — continue as unauthenticated
  }

  next();
}

export function sessionHandler(req: Request, res: Response): void {
  const user = req.context?.authUser as UserWithRoles | undefined;
  if (!user?.roles.some((role) => role.name === 'admin')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  res.json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function authMiddleware(req: Request, res: Response) {
  try {
    if (!env.PASSWORD_LOGIN_ENABLED) {
      res.status(403).json({ error: 'Password login is disabled' });
      return;
    }

    const { email, password } = authBodySchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      throw new Error('User not found matching email/password combination');
    }

    res.json({ token: issueToken(user.id) });
  } catch (e) {
    res.json({ error: (e as Error).message });
  }
}
