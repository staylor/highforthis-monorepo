import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

import { authenticator } from '~/auth';

export async function action({ request, context }: ActionFunctionArgs) {
  return authenticator.authenticate('user-pass', request, {
    successRedirect: '/admin',
    failureRedirect: '/login/unauthorized',
    context,
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  return authenticator.isAuthenticated(request, {
    successRedirect: '/admin',
  });
}
