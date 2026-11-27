import crypto from 'node:crypto';

import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import jsonwebtoken from 'jsonwebtoken';
import { lt } from 'remix/data-table';
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

// Anyone can start signing in, so starting saves nothing: the challenge goes to the browser
// signed, and comes back with its answer. A challenge is saved only once it has been answered, so
// it can't be answered again, which only an admin's passkey can do. Saving each start instead let
// anyone fill the table and turn every sign-in away. The key is made from TOKEN_SECRET but is its
// own, so a signed challenge and a session's token can't stand in for each other.
const challengeKey = crypto
  .createHmac('sha256', env.TOKEN_SECRET)
  .update('passkey sign-in challenges')
  .digest();

// An answered challenge is kept a minute past its signature, so an answer checked just before the
// signature ran out can't find it already gone
const USED_CHALLENGE_GRACE_MS = 60 * 1000;

const logger = createLogger({ serviceName: 'graphql' });

/** A failure whose message is meant for the browser. Any other error is logged, not shown. */
class PasskeyError extends Error {}

const expiredOrInvalid = () => new PasskeyError('The passkey request expired or is invalid');

// The browser's WebAuthn answer: SimpleWebAuthn checks all of it, but its ID is looked up first
const webAuthnResponse = z.looseObject({ id: z.string().min(1) });

const authenticationVerificationSchema = z.object({
  // A sign-in's signed challenge, or the ID of a registration's saved one
  challengeId: z.string().min(1),
  response: webAuthnResponse,
});

const registrationVerificationSchema = authenticationVerificationSchema.extend({
  name: z.string().trim().max(100).optional(),
});

// What a signed challenge says: the challenge, and when its signature runs out
const signedChallengeSchema = z.object({ challenge: z.string().min(1), exp: z.number() });

// What the passkey routes read from the request context
interface PasskeyContext {
  authUser: UserWithRoles | null;
  body: unknown;
}

function getAdminUser({ authUser }: PasskeyContext): UserWithRoles | null {
  return isAdmin(authUser) ? authUser : null;
}

/** A sign-in's challenge, signed to come back with its answer within five minutes */
function signChallenge(challenge: string): string {
  return jsonwebtoken.sign({ challenge }, challengeKey, {
    algorithm: 'HS256',
    expiresIn: CHALLENGE_TTL_MS / 1000,
  });
}

/** The challenge this server signed, and when its signature runs out, or an error once it has */
function signedChallenge(token: string): { challenge: string; expiresAt: Date } {
  let payload: unknown;
  try {
    payload = jsonwebtoken.verify(token, challengeKey, { algorithms: ['HS256'] });
  } catch {
    // Signed with another key, changed, or out of time
  }
  const signed = signedChallengeSchema.safeParse(payload);
  if (!signed.success) {
    throw expiredOrInvalid();
  }
  return { challenge: signed.data.challenge, expiresAt: new Date(signed.data.exp * 1000) };
}

/**
 * Saves an answered sign-in's challenge, which its unique index lets be saved once: of two
 * requests with the same answer, such as a replay, only the one that saves it goes on.
 */
async function saveAnsweredChallenge({
  challenge,
  expiresAt,
}: {
  challenge: string;
  expiresAt: Date;
}) {
  await db.deleteMany(webAuthnChallenges, { where: lt('expiresAt', new Date()) });
  const { affectedRows } = await db.query(webAuthnChallenges).upsert(
    {
      id: newId(),
      challenge,
      type: AUTHENTICATION_CHALLENGE,
      expiresAt: new Date(expiresAt.getTime() + USED_CHALLENGE_GRACE_MS),
    },
    { conflictTarget: ['challenge'], update: {} }
  );
  if (affectedRows === 0) {
    throw expiredOrInvalid();
  }
}

/** Saves the challenge an admin adding a passkey has five minutes to answer */
async function saveRegistrationChallenge(challenge: string, userId: string) {
  await db.deleteMany(webAuthnChallenges, { where: lt('expiresAt', new Date()) });

  return db.create(
    webAuthnChallenges,
    {
      id: newId(),
      challenge,
      type: REGISTRATION_CHALLENGE,
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
    { returnRow: true }
  );
}

/** Uses up the admin's registration challenge with this ID, answering it */
async function consumeRegistrationChallenge(id: string, userId: string) {
  const challenge = await db.find(webAuthnChallenges, id);
  // A challenge is answered once, valid or not. Deleting it is what uses it up, so of two requests
  // that answer the same one at once, only the one whose delete removed it goes on. A sign-in's
  // answered challenge is never deleted here, which would let its answer be used again.
  const consumed =
    challenge?.type === REGISTRATION_CHALLENGE &&
    (await db.delete(webAuthnChallenges, challenge.id));

  if (
    !challenge ||
    !consumed ||
    challenge.expiresAt.getTime() < Date.now() ||
    challenge.userId !== userId
  ) {
    throw expiredOrInvalid();
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
    // Imported on first use: the library adds about 5 MB of heap to every idle process.
    const { generateAuthenticationOptions } = await import('@simplewebauthn/server');
    const options = await generateAuthenticationOptions({
      rpID: env.WEBAUTHN_RP_ID,
      timeout: 60_000,
      userVerification: 'required',
    });

    // The browser sends the signed challenge back with its answer, as a saved one's ID was
    return Response.json({ challengeId: signChallenge(options.challenge), options });
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
    const signed = signedChallenge(body.challengeId);
    const passkey = await db.find(passkeysTable, response.id, { with: { user: passkeyUser } });

    if (!passkey?.user || !isAdmin(passkey.user)) {
      throw new PasskeyError('Passkey authentication failed');
    }

    const { verifyAuthenticationResponse } = await import('@simplewebauthn/server');
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: signed.challenge,
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
    await saveAnsweredChallenge(signed);

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
    const challenge = await saveRegistrationChallenge(options.challenge, user.id);

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
    const expectedChallenge = await consumeRegistrationChallenge(body.challengeId, user.id);
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
