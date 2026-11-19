import { graphqlHost } from '../../../lib/graphql.ts';

// Looked up per request rather than captured at startup, so tests can stub fetch.
const fetchNow: typeof fetch = (input, init) => globalThis.fetch(input, init);

/** Posts JSON and returns the token GraphQL answers with, or null when it answers an error. */
async function token(path: string, data: Record<string, unknown>): Promise<string | null> {
  const response = await fetchNow(`${graphqlHost}${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json().catch(() => null);
  return response.ok && typeof body?.token === 'string' ? body.token : null;
}

export const passwordLoginEnabled = () => process.env.PASSWORD_LOGIN_ENABLED !== 'false';

/**
 * Checks the sign-in form's passkey answer, or its email and password. Returns the admin's token
 * to keep in the session, or null when the form is incomplete or GraphQL turns it down.
 */
export async function signIn(formData: FormData): Promise<string | null> {
  if (formData.get('intent') === 'passkey') {
    const challengeId = formData.get('challengeId');
    const response = formData.get('response');
    if (typeof challengeId !== 'string' || typeof response !== 'string') {
      return null;
    }
    let answer: unknown;
    try {
      answer = JSON.parse(response);
    } catch {
      return null;
    }
    return token('/auth/passkeys/authenticate/verify', { challengeId, response: answer });
  }

  const email = formData.get('email');
  const password = formData.get('password');
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return null;
  }
  return token('/auth', { email, password });
}
