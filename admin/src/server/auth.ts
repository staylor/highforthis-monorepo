// Signing in through the GraphQL server's /auth endpoints

interface SignedIn {
  token: string;
}

// Posts JSON, and throws the endpoint's `error` message, which the login page shows
const post = async (url: string, data: Record<string, any>) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      return responseData;
    });

export const passwordLoginEnabled = () => process.env.PASSWORD_LOGIN_ENABLED !== 'false';

// Checks the login form's passkey response or email and password. Returns the user's token
// to keep in the session, or null when the form is incomplete or the server returns no user.
export async function signIn({
  graphqlHost,
  formData,
}: {
  graphqlHost: string;
  formData: FormData;
}): Promise<SignedIn | null> {
  let user: SignedIn | null;
  if (formData.get('intent') === 'passkey') {
    const challengeId = formData.get('challengeId');
    const response = formData.get('response');
    if (typeof challengeId !== 'string' || typeof response !== 'string') {
      return null;
    }
    user = await post(`${graphqlHost}/auth/passkeys/authenticate/verify`, {
      challengeId,
      response: JSON.parse(response),
    });
  } else {
    user = await post(`${graphqlHost}/auth`, {
      email: formData.get('email'),
      password: formData.get('password'),
    });
  }
  return user || null;
}
