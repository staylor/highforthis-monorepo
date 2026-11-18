import type { ActionFunctionArgs } from 'react-router';

import { passkeyRegistrationOptions } from '#/server/passkeys';
import { graphqlAuth } from '#/utils/route.server';

export async function action(args: ActionFunctionArgs) {
  return passkeyRegistrationOptions(await graphqlAuth(args));
}
