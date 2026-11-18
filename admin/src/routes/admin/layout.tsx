import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import type { MetaFunction } from 'react-router';
import { Outlet } from 'react-router';

import { rootData } from '@highforthis/shared/utils/rootData';
import titleTemplate from '@highforthis/shared/utils/title';

import NavMenu, { AdminNavProvider, useAdminNav } from '#/components/Admin/NavMenu';
import { requireAdminSession } from '#/utils/adminSession.server';

import type { Route } from './+types/layout';

export const handle = {
  layout: 'admin',
};

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Admin', siteSettings }),
    },
  ];
};

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAdminSession({ request, context });
  return {};
}

function AdminShell() {
  const { t } = useTranslation();
  const { isCollapsed } = useAdminNav();
  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark">
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
          <span className="truncate font-title text-2xl tracking-tight text-neutral-900 uppercase dark:text-white">
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
