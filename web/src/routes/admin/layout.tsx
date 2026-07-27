import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import type { LinksFunction, MetaFunction } from 'react-router';
import { redirect, Outlet } from 'react-router';

import { isAuthenticated } from '#/auth';
import NavMenu, { AdminNavProvider, useAdminNav } from '#/components/Admin/NavMenu';
import { sessionStorage } from '#/session';
import adminCss from '#/styles/admin.css?url';
import { rootData } from '#/utils/rootData';
import titleTemplate from '#/utils/title';

import type { Route } from './+types/layout';

export const handle = {
  layout: 'admin',
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: adminCss }];

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

function AdminShell() {
  const { t } = useTranslation();
  const { isCollapsed } = useAdminNav();
  return (
    <div className="dark:bg-surface-dark min-h-screen bg-white">
      <div id="portal" />
      <div className="absolute" id="atomicToolbar" />
      <NavMenu />
      <div
        className={cn('transition-[margin] duration-200 ease-out', {
          'lg:ml-64': !isCollapsed,
          'lg:ml-16': isCollapsed,
        })}
      >
        {/* Mobile header with the hamburger toggle */}
        <header
          className={cn(
            'sticky top-0 z-30 flex h-14 items-center gap-2 px-2 lg:hidden',
            'border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl',
            'dark:bg-surface-dark/90 dark:border-white/10'
          )}
        >
          <NavMenu.MobileToggle />
          <span className="font-title truncate text-base tracking-tight text-neutral-900 uppercase dark:text-white">
            {t('title')}
          </span>
        </header>
        <main className="relative z-20 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <AdminNavProvider>
      <AdminShell />
    </AdminNavProvider>
  );
}
