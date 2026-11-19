// The admin session that tests sign in with. React Router's createCookieSessionStorage signed the
// cookie with `testSecret`, holding `testToken`. remix/cookie signs the same way, so the cookie
// also checks that the format hasn't changed. Set `process.env.TOKEN_SECRET` to `testSecret` for
// the app to accept it.

export const testSecret = 'test-secret';

export const testToken = 'test-token';

export const testSession =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ==.0jvC0SjKdfmXr5Rw/6679ia0w0xRgH4hIpEzB3aJ9Fc';
