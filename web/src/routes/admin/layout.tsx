import cn from 'classnames';
import { useState } from 'react';
import type { LinksFunction, MetaFunction } from 'react-router';
import { redirect, Outlet } from 'react-router';

import { isAuthenticated } from '#/auth';
import NavMenu from '#/components/Admin/NavMenu';
import { sessionStorage } from '#/session';
import adminCss from '#/styles/admin.css?url';
import { rootData } from '#/utils/rootData';
import titleTemplate from '#/utils/title';

import type { Route } from './+types/layout';

export const handle = {
  layout: 'admin',
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: '/css/dashicons.min.css' },
  { rel: 'stylesheet', href: adminCss },
];

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Admin', siteSettings }),
    },
  ];
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const token = await isAuthenticated(request);
  if (!token) {
    return redirect('/login/unauthorized');
  }

  const response = await fetch(`${context.graphqlHost}/auth/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    return {};
  }
  if (response.status !== 401 && response.status !== 403) {
    throw new Response('Unable to validate the admin session', { status: 503 });
  }

  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  return redirect('/login/unauthorized', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
}

export default function Admin() {
  const [isCollapsed, setCollapsed] = useState(false);
  return (
    <div className="mx-auto min-h-[calc(100vh-48px)] bg-white px-12 py-6">
      <section>
        <div id="portal" />
        <div className="absolute" id="atomicToolbar" />
        <NavMenu toggleCollapse={() => setCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
        <section
          className={cn('relative z-30 h-full px-5 pb-16', {
            'ml-9 lg:ml-40': !isCollapsed,
            'ml-9 lg:ml-9': isCollapsed,
          })}
        >
          <Outlet />
        </section>
      </section>
    </div>
  );
}
