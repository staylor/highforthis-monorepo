import { createContextKey, type Middleware } from 'remix/router';

import type { UserWithRoles } from '#/models';

/** The user the request's bearer token belongs to, or null, set by `jwt()`. */
export const AuthUser = createContextKey<UserWithRoles | null>(null);

/** The parsed request body, set by `parseBody()`. */
export const Body = createContextKey<unknown>(undefined);

// The default limit of express.json() and express.urlencoded(), which parsed bodies before
const BODY_LIMIT = 100 * 1024;

class BodyError extends Error {
  constructor(public status: 400 | 413) {
    super(status === 413 ? 'Payload Too Large' : 'Bad Request');
  }
}

async function readText(body: ReadableStream<Uint8Array>, contentLength: string | null) {
  if (Number(contentLength) > BODY_LIMIT) {
    throw new BodyError(413);
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of body) {
    size += chunk.byteLength;
    if (size > BODY_LIMIT) {
      throw new BodyError(413);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Reads a JSON or URL-encoded body the way express.json() and express.urlencoded() did: an empty
 * JSON body is `{}`, JSON must be an object or an array, and other bodies are left unread.
 */
async function readBody(request: Request): Promise<unknown> {
  const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (
    !request.body ||
    (type !== 'application/json' && type !== 'application/x-www-form-urlencoded')
  ) {
    return undefined;
  }

  const text = await readText(request.body, request.headers.get('content-length'));
  if (type === 'application/x-www-form-urlencoded') {
    return Object.fromEntries(new URLSearchParams(text));
  }
  if (!text) {
    return {};
  }
  if (!/^\s*[[{]/.test(text)) {
    throw new BodyError(400);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new BodyError(400);
  }
}

/** Puts the request's JSON or URL-encoded body on `context.body`. */
export function parseBody(): Middleware<{ key: typeof Body; value: unknown; property: 'body' }> {
  return async (context, next) => {
    let body: unknown;
    try {
      body = await readBody(context.request);
    } catch (error) {
      if (error instanceof BodyError) {
        return new Response(error.message, { status: error.status });
      }
      throw error;
    }
    context.set(Body, body, { property: 'body' });
    return next();
  };
}
