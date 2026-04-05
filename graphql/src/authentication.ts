import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { z } from 'zod';

import prisma from '#/database';
import env from '#/env';

type JWTPayload = {
  userId: string;
};

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

export async function authMiddleware(req: Request, res: Response) {
  try {
    const { email, password } = authBodySchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      throw new Error('User not found matching email/password combination');
    }

    const token = jsonwebtoken.sign({ userId: user.id }, env.TOKEN_SECRET);
    res.json({ token });
  } catch (e) {
    res.json({ error: (e as Error).message });
  }
}
