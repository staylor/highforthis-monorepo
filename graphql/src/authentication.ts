import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction, Router } from 'express';
import jwt from 'jwt-simple';
import { ObjectId, type Document } from 'mongodb';
import passport from 'passport';
import type { VerifiedCallback } from 'passport-jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';

import type User from './models/User';

type JWTPayload = {
  userId: string;
};

async function userFromPayload(
  { context: { User } }: { context: { User: User } },
  jwtPayload: JWTPayload
) {
  if (!jwtPayload.userId) {
    throw new Error('No userId in JWT');
  }

  const id = new ObjectId(jwtPayload.userId);
  const user = await User.findOneById(id);
  return user;
}

export function initialize(app: Router) {
  app.use(passport.initialize());

  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.TOKEN_SECRET || '',
        passReqToCallback: true,
      },
      (request: Request, jwtPayload: JWTPayload, done: VerifiedCallback) => {
        userFromPayload(request, jwtPayload)
          .then((user) => {
            if (user) {
              done(null, user);
            } else {
              done(null, false);
            }
          })
          .catch((e) => {
            done(e, false);
          });
      }
    )
  );
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('jwt', { session: false }, (_err: any, user: Document) => {
    if (user) {
      req.context.authUser = user;
    }
    next();
  })(req, res, next);
}

export async function authMiddleware(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Username or password not set on request');
    }

    const userModel = req.context.User;
    const user = await userModel.collection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      throw new Error('User not found matching email/password combination');
    }

    const payload = {
      userId: user._id.toString(),
    };

    if (!process.env.TOKEN_SECRET) {
      throw new Error('TOKEN_SECRET does not exist on process.env');
    }

    const token = jwt.encode(payload, process.env.TOKEN_SECRET);
    res.json({ token });
  } catch (e) {
    res.json({ error: (e as Error).message });
  }
}
