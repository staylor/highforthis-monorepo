import type { ActionFunctionArgs, AppLoadContext } from 'react-router';

import { passkeyApi } from './server';
import type { RegistrationVerificationRequest } from './types';

export async function action({ request, context }: ActionFunctionArgs) {
  const body = (await request.json()) as RegistrationVerificationRequest;

  return passkeyApi({
    request,
    context: context as AppLoadContext,
    path: '/register/verify',
    init: {
      method: 'POST',
      body: JSON.stringify(body),
    },
  });
}
