import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';

type JWTPayload = {
  userId: string;
};

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export async function jwtMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token || !process.env.TOKEN_SECRET) {
    next();
    return;
  }

  try {
    const payload = jsonwebtoken.verify(token, process.env.TOKEN_SECRET) as JWTPayload;
    if (payload.userId) {
      const user = await req.context.prisma.user.findUnique({
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
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Username or password not set on request');
    }

    const { prisma } = req.context;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      throw new Error('User not found matching email/password combination');
    }

    if (!process.env.TOKEN_SECRET) {
      throw new Error('TOKEN_SECRET does not exist on process.env');
    }

    const token = jsonwebtoken.sign({ userId: user.id }, process.env.TOKEN_SECRET);
    res.json({ token });
  } catch (e) {
    res.json({ error: (e as Error).message });
  }
}
