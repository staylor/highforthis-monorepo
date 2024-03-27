import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { authenticator } from '@/auth';

export const action: ActionFunction = async ({ request, context }) => {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/admin',
    failureRedirect: '/login/unauthorized',
    context,
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/admin',
  });
};
