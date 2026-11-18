import type { ActionFunctionArgs } from 'react-router';

import { verifyPasskeyRegistration } from '#/server/passkeys';
import type { RegistrationVerificationRequest } from '#/types/passkeys';
import { graphqlAuth } from '#/utils/route.server';

export async function action(args: ActionFunctionArgs) {
  const auth = await graphqlAuth(args);
  const body = (await args.request.json()) as RegistrationVerificationRequest;
  return verifyPasskeyRegistration({ ...auth, body });
}
