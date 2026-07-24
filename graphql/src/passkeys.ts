import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type { Request, Response } from 'express';
import { z } from 'zod';

import { issueToken } from '#/authentication';
import prisma from '#/database';
import env from '#/env';
import type { UserWithRoles } from '#/models';

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const AUTHENTICATION_CHALLENGE = 'authentication';
const REGISTRATION_CHALLENGE = 'registration';

const authenticationVerificationSchema = z.object({
  challengeId: z.string().min(1),
  response: z.unknown(),
});

const registrationVerificationSchema = authenticationVerificationSchema.extend({
  name: z.string().trim().max(100).optional(),
});

const authenticatorTransports = new Set<AuthenticatorTransportFuture>([
  'ble',
  'cable',
  'hybrid',
  'internal',
  'nfc',
  'smart-card',
  'usb',
]);

function getAdminUser(req: Request): UserWithRoles | null {
  const user = req.context?.authUser as UserWithRoles | undefined;
  return user?.roles.some((role) => role.name === 'admin') ? user : null;
}

function parseTransports(transports: string[]): AuthenticatorTransportFuture[] {
  return transports.filter((transport): transport is AuthenticatorTransportFuture =>
    authenticatorTransports.has(transport as AuthenticatorTransportFuture)
  );
}

async function saveChallenge({
  challenge,
  type,
  userId,
}: {
  challenge: string;
  type: typeof AUTHENTICATION_CHALLENGE | typeof REGISTRATION_CHALLENGE;
  userId?: string;
}) {
  await prisma.webAuthnChallenge.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return prisma.webAuthnChallenge.create({
    data: {
      challenge,
      type,
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });
}

async function consumeChallenge({
  id,
  type,
  userId,
}: {
  id: string;
  type: typeof AUTHENTICATION_CHALLENGE | typeof REGISTRATION_CHALLENGE;
  userId?: string;
}) {
  const challenge = await prisma.webAuthnChallenge.findUnique({ where: { id } });

  if (
    !challenge ||
    challenge.type !== type ||
    challenge.expiresAt.getTime() < Date.now() ||
    (userId !== undefined && challenge.userId !== userId)
  ) {
    if (challenge) {
      await prisma.webAuthnChallenge.delete({ where: { id: challenge.id } });
    }
    throw new Error('The passkey request expired or is invalid');
  }

  await prisma.webAuthnChallenge.delete({ where: { id: challenge.id } });
  return challenge.challenge;
}

function sendError(res: Response, error: unknown, status = 400): void {
  const message = error instanceof Error ? error.message : 'Passkey request failed';
  res.status(status).json({ error: message });
}

export async function authenticationOptionsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const options = await generateAuthenticationOptions({
      rpID: env.WEBAUTHN_RP_ID,
      timeout: 60_000,
      userVerification: 'required',
    });
    const challenge = await saveChallenge({
      challenge: options.challenge,
      type: AUTHENTICATION_CHALLENGE,
    });

    res.json({ challengeId: challenge.id, options });
  } catch (error) {
    sendError(res, error);
  }
}

export async function authenticationVerificationHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = authenticationVerificationSchema.parse(req.body);
    const response = body.response as AuthenticationResponseJSON;
    const expectedChallenge = await consumeChallenge({
      id: body.challengeId,
      type: AUTHENTICATION_CHALLENGE,
    });
    const passkey = await prisma.passkey.findUnique({
      where: { id: response.id },
      include: { user: { include: { roles: true } } },
    });

    if (!passkey || !passkey.user.roles.some((role) => role.name === 'admin')) {
      throw new Error('Passkey authentication failed');
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
        transports: parseTransports(passkey.transports),
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      throw new Error('Passkey authentication failed');
    }

    await prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        backedUp: verification.authenticationInfo.credentialBackedUp,
        deviceType: verification.authenticationInfo.credentialDeviceType,
        lastUsedAt: new Date(),
      },
    });

    res.json({ token: issueToken(passkey.userId) });
  } catch (error) {
    sendError(res, error, 401);
  }
}

export async function registrationOptionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = getAdminUser(req);
    if (!user) {
      sendError(res, new Error('Authentication required'), 401);
      return;
    }

    const passkeys = await prisma.passkey.findMany({ where: { userId: user.id } });
    const options = await generateRegistrationOptions({
      rpName: env.WEBAUTHN_RP_NAME,
      rpID: env.WEBAUTHN_RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      userDisplayName: user.name ?? user.email,
      timeout: 60_000,
      attestationType: 'none',
      excludeCredentials: passkeys.map((passkey) => ({
        id: passkey.id,
        transports: parseTransports(passkey.transports),
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    });
    const challenge = await saveChallenge({
      challenge: options.challenge,
      type: REGISTRATION_CHALLENGE,
      userId: user.id,
    });

    res.json({ challengeId: challenge.id, options });
  } catch (error) {
    sendError(res, error);
  }
}

export async function registrationVerificationHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = getAdminUser(req);
    if (!user) {
      sendError(res, new Error('Authentication required'), 401);
      return;
    }

    const body = registrationVerificationSchema.parse(req.body);
    const response = body.response as RegistrationResponseJSON;
    const expectedChallenge = await consumeChallenge({
      id: body.challengeId,
      type: REGISTRATION_CHALLENGE,
      userId: user.id,
    });
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error('Passkey registration failed');
    }

    const { credential, credentialBackedUp, credentialDeviceType } = verification.registrationInfo;
    const passkey = await prisma.passkey.create({
      data: {
        id: credential.id,
        userId: user.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
        transports: credential.transports ?? [],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        name: body.name || null,
      },
    });

    res.status(201).json({
      passkey: {
        id: passkey.id,
        name: passkey.name,
        createdAt: passkey.createdAt,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
}

export async function listPasskeysHandler(req: Request, res: Response): Promise<void> {
  const user = getAdminUser(req);
  if (!user) {
    sendError(res, new Error('Authentication required'), 401);
    return;
  }

  const passkeys = await prisma.passkey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      backedUp: true,
      deviceType: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
  res.json({ passkeys });
}

export async function deletePasskeyHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = getAdminUser(req);
    if (!user) {
      sendError(res, new Error('Authentication required'), 401);
      return;
    }

    const credentialId = z.string().min(1).parse(req.params.credentialId);
    const passkeys = await prisma.passkey.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!passkeys.some((passkey) => passkey.id === credentialId)) {
      sendError(res, new Error('Passkey not found'), 404);
      return;
    }
    if (!env.PASSWORD_LOGIN_ENABLED && passkeys.length === 1) {
      sendError(res, new Error('The last passkey cannot be removed'), 409);
      return;
    }

    await prisma.passkey.delete({ where: { id: credentialId } });
    res.sendStatus(204);
  } catch (error) {
    sendError(res, error);
  }
}
