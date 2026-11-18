import { useLoaderData } from 'react-router';

import Form from './Form';
import type { loader } from './utils';

export { action, loader } from './utils';

export default function Login() {
  const { passwordLoginEnabled } = useLoaderData<typeof loader>();

  return <Form passwordLoginEnabled={passwordLoginEnabled} />;
}
