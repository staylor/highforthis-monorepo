import { graphqlHost } from '#/lib/graphql.ts';

// Looked up per request rather than captured at startup, so tests can stub fetch.
const fetchNow: typeof fetch = (input, init) => globalThis.fetch(input, init);

/** A token to keep in the session, or why there isn't one. */
type SignInResult = { token: string } | { error: 'failed' | 'throttled' };

const failed: SignInResult = { error: 'failed' };

/** Posts JSON and returns the token GraphQL answers with, or why it turned the sign-in down. */
async function token(path: string, data: Record<string, unknown>): Promise<SignInResult> {
  const response = await fetchNow(`${graphqlHost}${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 429) {
    await response.body?.cancel();
    return { error: 'throttled' };
  }
  const body = await response.json().catch(() => null);
  return response.ok && typeof body?.token === 'string' ? { token: body.token } : failed;
}

export const passwordLoginEnabled = () => process.env.PASSWORD_LOGIN_ENABLED !== 'false';

/**
 * Checks the sign-in form's passkey answer, or its email and password. Returns the admin's token
 * to keep in the session, or an error when the form is incomplete, GraphQL turns it down, or
 * GraphQL has seen too many failures for that email.
 */
export async function signIn(formData: FormData): Promise<SignInResult> {
  if (formData.get('intent') === 'passkey') {
    const challengeId = formData.get('challengeId');
    const response = formData.get('response');
    if (typeof challengeId !== 'string' || typeof response !== 'string') {
      return failed;
    }
    let answer: unknown;
    try {
      answer = JSON.parse(response);
    } catch {
      return failed;
    }
    return token('/auth/passkeys/authenticate/verify', { challengeId, response: answer });
  }

  const email = formData.get('email');
  const password = formData.get('password');
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return failed;
  }
  return token('/auth', { email, password });
}

/** Ends the token's session in GraphQL, so a copy of it stops working too. Best effort. */
export async function signOut(token: string): Promise<void> {
  try {
    const response = await fetchNow(`${graphqlHost}/auth/signout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await response.body?.cancel();
  } catch {
    // The cookie is removed anyway, and the token runs out within 12 hours
  }
}
