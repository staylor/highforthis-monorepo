import type {
  PasskeyListResponse,
  RegistrationOptionsResponse,
  RegistrationVerificationRequest,
} from '#/types/passkeys';

// The signed-in user's passkeys, managed through the GraphQL server's /auth/passkeys endpoints

interface PasskeyAuth {
  graphqlHost: string;
  // The session's token; without one the request is rejected
  token: string | undefined;
}

async function passkeyApi<T>(
  { graphqlHost, token }: PasskeyAuth,
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!token) {
    throw new Response('Authentication required', { status: 401 });
  }

  const response = await fetch(`${graphqlHost}/auth/passkeys${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json()) as T & { error?: string };
  if (!response.ok || data.error) {
    throw new Error(data.error ?? 'Passkey request failed');
  }

  return data;
}

export function listPasskeys(auth: PasskeyAuth) {
  return passkeyApi<PasskeyListResponse>(auth, '');
}

// The remove button's form names the passkey by credentialId
export async function deletePasskey({ formData, ...auth }: PasskeyAuth & { formData: FormData }) {
  const credentialId = formData.get('credentialId');
  if (typeof credentialId !== 'string') {
    throw new Error('Passkey ID is required');
  }

  await passkeyApi(auth, `/${encodeURIComponent(credentialId)}`, { method: 'DELETE' });

  return { deleted: true };
}

// Starts adding a passkey: the options the browser's WebAuthn call needs
export function passkeyRegistrationOptions(auth: PasskeyAuth) {
  return passkeyApi<RegistrationOptionsResponse>(auth, '/register/options', { method: 'POST' });
}

// Finishes adding a passkey with the browser's response
export function verifyPasskeyRegistration({
  body,
  ...auth
}: PasskeyAuth & { body: RegistrationVerificationRequest }) {
  return passkeyApi(auth, '/register/verify', { method: 'POST', body: JSON.stringify(body) });
}
