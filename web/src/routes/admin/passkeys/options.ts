import type { ActionFunctionArgs, AppLoadContext } from 'react-router';

import { passkeyApi } from './server';
import type { RegistrationOptionsResponse } from './types';

export async function action({ request, context }: ActionFunctionArgs) {
  return passkeyApi<RegistrationOptionsResponse>({
    request,
    context: context as AppLoadContext,
    path: '/register/options',
    init: { method: 'POST' },
  });
}
