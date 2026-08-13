import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';

import { isAuthenticated } from '#/auth';
import { graphqlHostContext } from '#/context.js';
import { sessionStorage } from '#/session';
import { post } from '#/utils/action';

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const form = await request.formData();
  const intent = form.get('intent');
  const graphqlHost = context.get(graphqlHostContext);
  let user;

  if (intent === 'passkey') {
    const challengeId = form.get('challengeId');
    const response = form.get('response');
    if (typeof challengeId !== 'string' || typeof response !== 'string') {
      return redirect('/login/unauthorized');
    }
    user = await post(`${graphqlHost}/auth/passkeys/authenticate/verify`, {
      challengeId,
      response: JSON.parse(response),
    });
  } else {
    user = await post(`${graphqlHost}/auth`, {
      email: form.get('email'),
      password: form.get('password'),
    });
  }

  if (user) {
    session.set('token', user.token);

    return redirect('/admin', {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    });
  }

  return redirect('/login/unauthorized');
}

export async function loader({ request }: LoaderFunctionArgs) {
  if (await isAuthenticated(request)) {
    return redirect('/admin');
  }

  return {
    passwordLoginEnabled: process.env.PASSWORD_LOGIN_ENABLED !== 'false',
  };
}
