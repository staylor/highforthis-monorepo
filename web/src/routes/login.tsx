import { Outlet, useParams } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/server-runtime';

import Wrapper from '@/components/Login/Wrapper';
import Message from '@/components/Form/Message';

export const handle = {
  layout: 'login',
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: '/css/dashicons.min.css' }];

export default function Login() {
  const params = useParams();
  let error;
  switch (params.error) {
    case 'unauthorized':
      error = 'You must login to access this area.';
      break;
    case 'required':
      error = 'All fields are required.';
      break;
  }

  return (
    <Wrapper>
      {error && <Message dismissable={false} text={error} />}
      <Outlet />
    </Wrapper>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Wrapper>
      <Message dismissable={false} text={error.message} />
      <Outlet />
    </Wrapper>
  );
}
