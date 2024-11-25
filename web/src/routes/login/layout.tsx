import { Outlet, useParams } from 'react-router';
import type { LinksFunction } from 'react-router';

import Message from '~/components/Form/Message';

import Wrapper from './Wrapper';

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
