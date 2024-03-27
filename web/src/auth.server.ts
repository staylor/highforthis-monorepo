import { type AppLoadContext } from '@remix-run/server-runtime';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { post } from '@/utils/action';

import { sessionStorage } from './session.server';

interface User {
  token: string;
}

const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
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

    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass'
);

export { authenticator };
