import { graphqlFetch } from '#/lib/graphql.ts';

import type { PasskeyListResponse } from './types.ts';

export function passkeyApi(token: string, path: string, init?: RequestInit) {
  return graphqlFetch(`/auth/passkeys${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}

/** Throws the endpoint's `error`, or a general message, when it didn't succeed. */
async function check(response: Response) {
  if (response.status === 204) {
    return undefined;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error ?? 'Passkey request failed');
  }
  return data;
}

export async function listPasskeys(token: string): Promise<PasskeyListResponse> {
  return check(await passkeyApi(token, ''));
}

export async function deletePasskey(token: string, formData: FormData) {
  const credentialId = formData.get('credentialId');
  if (typeof credentialId !== 'string' || !credentialId) {
    throw new Error('Passkey ID is required');
  }
  await check(
    await passkeyApi(token, `/${encodeURIComponent(credentialId)}`, { method: 'DELETE' })
  );
}
