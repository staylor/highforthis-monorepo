import type { AppLoadContext } from 'react-router';

import { isAuthenticated } from '#/auth';

export async function passkeyApi<T>({
  request,
  context,
  path,
  init,
}: {
  request: Request;
  context: AppLoadContext;
  path: string;
  init?: RequestInit;
}): Promise<T> {
  const token = await isAuthenticated(request);
  if (!token) {
    throw new Response('Authentication required', { status: 401 });
  }

  const response = await fetch(`${context.graphqlHost}/auth/passkeys${path}`, {
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
