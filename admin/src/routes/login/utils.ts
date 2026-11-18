import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';

import { isAuthenticated } from '#/auth';
import { graphqlHostContext } from '#/context';
import { passwordLoginEnabled, signIn } from '#/server/auth';
import { sessionStorage } from '#/session';

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const user = await signIn({
    graphqlHost: context.get(graphqlHostContext),
    formData: await request.formData(),
  });

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
    passwordLoginEnabled: passwordLoginEnabled(),
  };
}
