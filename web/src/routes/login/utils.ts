import {
  redirect,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
} from 'react-router';

import { isAuthenticated } from '~/auth';
import { sessionStorage } from '~/session';
import { post } from '~/utils/action';

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  const authUrl = `${(context as AppLoadContext).graphqlHost}/auth`;

  let user;

  try {
    user = await post(authUrl, {
      email,
      password,
    });
  } catch (e) {
    throw e;
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
}
