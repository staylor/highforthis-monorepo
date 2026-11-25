import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import { and, gt, lt } from 'remix/data-table';
import { z } from 'zod';

import { createLogger } from '@highforthis/shared/logger';

import { issueToken } from '#/authentication';
import { isAdmin } from '#/authorization';
import db from '#/database/db';
import {
  newId,
  passkeys as passkeysTable,
  passkeyUser,
  webAuthnChallenges,
} from '#/database/tables';
import env from '#/env';
import type { UserWithRoles } from '#/models';

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const AUTHENTICATION_CHALLENGE = 'authentication';
const REGISTRATION_CHALLENGE = 'registration';
// Anyone can start signing in, and each start saves a challenge for five minutes. Past this many
// at once, starts are turned away until some expire, so the table can't be flooded.
const MAX_PENDING_AUTHENTICATIONS = 5000;

const logger = createLogger({ serviceName: 'graphql' });

/** A failure whose message is meant for the browser. Any other error is logged, not shown. */
class PasskeyError extends Error {}

// The browser's WebAuthn answer: SimpleWebAuthn checks all of it, but its ID is looked up first
const webAuthnResponse = z.looseObject({ id: z.string().min(1) });

const authenticationVerificationSchema = z.object({
  challengeId: z.string().min(1),
  response: webAuthnResponse,
});

const registrationVerificationSchema = authenticationVerificationSchema.extend({
  name: z.string().trim().max(100).optional(),
});

// What the passkey routes read from the request context
interface PasskeyContext {
  authUser: UserWithRoles | null;
  body: unknown;
}

function getAdminUser({ authUser }: PasskeyContext): UserWithRoles | null {
  return isAdmin(authUser) ? authUser : null;
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
  await db.deleteMany(webAuthnChallenges, { where: lt('expiresAt', new Date()) });

  return db.create(
    webAuthnChallenges,
    {
      id: newId(),
      challenge,
      type,
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
    { returnRow: true }
  );
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
  const challenge = await db.find(webAuthnChallenges, id);
  // A challenge is answered once, valid or not. Deleting it is what uses it up, so of two requests
  // that answer the same one at once, only the one whose delete removed it goes on.
  const consumed = challenge !== null && (await db.delete(webAuthnChallenges, challenge.id));

  if (
    !challenge ||
    !consumed ||
    challenge.type !== type ||
    challenge.expiresAt.getTime() < Date.now() ||
    (userId !== undefined && challenge.userId !== userId)
  ) {
    throw new PasskeyError('The passkey request expired or is invalid');
  }

  return challenge.challenge;
}

function errorResponse(error: unknown, status = 400): Response {
  if (error instanceof PasskeyError) {
    return Response.json({ error: error.message }, { status });
  }
  if (error instanceof z.ZodError) {
    return Response.json({ error: 'The passkey request is incomplete' }, { status });
  }
  logger.warn({ err: error }, 'Passkey request failed');
  return Response.json({ error: 'Passkey request failed' }, { status });
}

export async function authenticationOptionsHandler(): Promise<Response> {
  try {
    const pending = await db.count(webAuthnChallenges, {
      where: and({ type: AUTHENTICATION_CHALLENGE }, gt('expiresAt', new Date())),
    });
    if (pending >= MAX_PENDING_AUTHENTICATIONS) {
      return Response.json(
        { error: 'Too many sign-ins in progress. Try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(CHALLENGE_TTL_MS / 1000) } }
      );
    }
    // Imported on first use: the library adds about 5 MB of heap to every idle process.
    const { generateAuthenticationOptions } = await import('@simplewebauthn/server');
    const options = await generateAuthenticationOptions({
      rpID: env.WEBAUTHN_RP_ID,
      timeout: 60_000,
      userVerification: 'required',
    });
    const challenge = await saveChallenge({
      challenge: options.challenge,
      type: AUTHENTICATION_CHALLENGE,
    });

    return Response.json({ challengeId: challenge.id, options });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function authenticationVerificationHandler(
  context: PasskeyContext
): Promise<Response> {
  try {
    const body = authenticationVerificationSchema.parse(context.body);
    const response = body.response as unknown as AuthenticationResponseJSON;
    const expectedChallenge = await consumeChallenge({
      id: body.challengeId,
      type: AUTHENTICATION_CHALLENGE,
    });
    const passkey = await db.find(passkeysTable, response.id, { with: { user: passkeyUser } });

    if (!passkey?.user || !isAdmin(passkey.user)) {
      throw new PasskeyError('Passkey authentication failed');
    }

    const { verifyAuthenticationResponse } = await import('@simplewebauthn/server');
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
        transports: passkey.transports ?? [],
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      throw new PasskeyError('Passkey authentication failed');
    }

    await db.update(passkeysTable, passkey.id, {
      counter: String(verification.authenticationInfo.newCounter),
      backedUp: verification.authenticationInfo.credentialBackedUp,
      deviceType: verification.authenticationInfo.credentialDeviceType,
      lastUsedAt: new Date(),
    });

    return Response.json({ token: await issueToken(passkey.userId) });
  } catch (error) {
    return errorResponse(error, 401);
  }
}

export async function registrationOptionsHandler(context: PasskeyContext): Promise<Response> {
  try {
    const user = getAdminUser(context);
    if (!user) {
      return errorResponse(new PasskeyError('Authentication required'), 401);
    }

    const passkeys = await db.findMany(passkeysTable, { where: { userId: user.id } });
    const { generateRegistrationOptions } = await import('@simplewebauthn/server');
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
        transports: passkey.transports ?? [],
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

    return Response.json({ challengeId: challenge.id, options });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function registrationVerificationHandler(context: PasskeyContext): Promise<Response> {
  try {
    const user = getAdminUser(context);
    if (!user) {
      return errorResponse(new PasskeyError('Authentication required'), 401);
    }

    const body = registrationVerificationSchema.parse(context.body);
    const response = body.response as unknown as RegistrationResponseJSON;
    const expectedChallenge = await consumeChallenge({
      id: body.challengeId,
      type: REGISTRATION_CHALLENGE,
      userId: user.id,
    });
    const { verifyRegistrationResponse } = await import('@simplewebauthn/server');
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new PasskeyError('Passkey registration failed');
    }

    const { credential, credentialBackedUp, credentialDeviceType } = verification.registrationInfo;
    const passkey = await db.create(
      passkeysTable,
      {
        id: credential.id,
        userId: user.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: String(credential.counter),
        transports: credential.transports ?? [],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        name: body.name || null,
      },
      { returnRow: true }
    );

    return Response.json(
      {
        passkey: {
          id: passkey.id,
          name: passkey.name,
          createdAt: passkey.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function listPasskeysHandler(context: PasskeyContext): Promise<Response> {
  const user = getAdminUser(context);
  if (!user) {
    return errorResponse(new PasskeyError('Authentication required'), 401);
  }

  const passkeys = await db
    .query(passkeysTable)
    .where({ userId: user.id })
    .orderBy('createdAt', 'desc')
    .select('id', 'name', 'backedUp', 'deviceType', 'createdAt', 'lastUsedAt')
    .all();
  return Response.json({ passkeys });
}

export async function deletePasskeyHandler(
  context: PasskeyContext & { params: { credentialId: string } }
): Promise<Response> {
  try {
    const user = getAdminUser(context);
    if (!user) {
      return errorResponse(new PasskeyError('Authentication required'), 401);
    }

    const credentialId = z.string().min(1).parse(context.params.credentialId);
    const passkeys = await db.query(passkeysTable).where({ userId: user.id }).select('id').all();

    if (!passkeys.some((passkey) => passkey.id === credentialId)) {
      return errorResponse(new PasskeyError('Passkey not found'), 404);
    }
    if (!env.PASSWORD_LOGIN_ENABLED && passkeys.length === 1) {
      return errorResponse(new PasskeyError('The last passkey cannot be removed'), 409);
    }

    await db.delete(passkeysTable, credentialId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
