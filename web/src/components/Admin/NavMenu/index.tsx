import cn from 'classnames';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router';

import Icon from '#/components/Icon';
import { getItem, setItem, removeItem } from '#/utils/storage';

import CollapseButton from './CollapseButton';
import NavLink from './NavLink';
import SubNav from './SubNav';
import useRouteConfig from './useRouteConfig';
import { isRouteActive } from './utils';

const STORAGE_KEY = 'adminNavCollapsed';

interface AdminNavContextValue {
  isCollapsed: boolean;
  isOpen: boolean;
  toggleCollapse: () => void;
  toggleOpen: () => void;
}

const AdminNavContext = createContext<AdminNavContextValue>({
  isCollapsed: false,
  isOpen: false,
  toggleCollapse: () => {},
  toggleOpen: () => {},
});

export const useAdminNav = () => useContext(AdminNavContext);

export function AdminNavProvider({ children }: PropsWithChildren) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const location = useLocation();

  // restore the persisted rail state (client only, avoids hydration mismatch)
  useEffect(() => {
    if (getItem(STORAGE_KEY)) {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      if (prev) {
        removeItem(STORAGE_KEY);
      } else {
        setItem(STORAGE_KEY, '1');
      }
      return !prev;
    });
  }, []);

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  // close the mobile drawer whenever we navigate
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // close the mobile drawer on escape, and lock scrolling behind it
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ isCollapsed, isOpen, toggleCollapse, toggleOpen }),
    [isCollapsed, isOpen, toggleCollapse, toggleOpen]
  );

  return <AdminNavContext.Provider value={value}>{children}</AdminNavContext.Provider>;
}

function NavList({ isCollapsed }: { isCollapsed: boolean }) {
  const routeConfig = useRouteConfig();
  const location = useLocation();
  const [hovered, setHovered] = useState('');
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-3">
      {routeConfig.map((items, i) => (
        <div
          key={`${i.toString(16)}`}
          className={cn('flex flex-col gap-0.5', {
            'mt-2 border-t border-neutral-200/80 pt-2 dark:border-white/10': i > 0,
          })}
        >
          {items.map((item, j) => {
            if (!item.label) {
              return null;
            }

            const key = `${i}-${j}`;
            const hasSubNav = Boolean(item.routes && item.routes.length > 0);
            const isActive = isRouteActive(item, location.pathname);
            const isHovered = hovered === key;
            // sections open themselves when active, and can be toggled by hand
            const isExpanded = toggled[key] ?? isActive;

            return (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered('')}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered('')}
              >
                <NavLink
                  item={item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  isExpanded={isExpanded}
                  hasSubNav={hasSubNav}
                  onToggle={() => setToggled((prev) => ({ ...prev, [key]: !isExpanded }))}
                />
                {hasSubNav && (
                  <SubNav
                    item={item}
                    isCollapsed={isCollapsed}
                    isExpanded={isExpanded}
                    isHovered={isHovered}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Brand({ isCollapsed }: { isCollapsed: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/admin"
      className={cn('hover:text-pink flex min-w-0 items-center gap-2.5 no-underline', {
        'justify-center': isCollapsed,
      })}
    >
      {isCollapsed ? (
        <span className="bg-pink flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white">
          {t('title').charAt(0)}
        </span>
      ) : (
        <span className="font-title truncate text-base tracking-tight text-neutral-900 uppercase dark:text-white">
          {t('title')}
        </span>
      )}
    </Link>
  );
}

const headerClassName = cn(
  'flex h-14 shrink-0 items-center justify-between gap-2 px-3',
  'border-b border-neutral-200/80 dark:border-white/10'
);

const panelClassName = cn(
  'flex h-full flex-col bg-white dark:bg-surface-dark-elevated',
  'border-r border-neutral-200/80 dark:border-white/10'
);

function NavMenu() {
  const { t } = useTranslation();
  const { isCollapsed, isOpen, toggleCollapse, toggleOpen } = useAdminNav();

  return (
    <>
      {/* Desktop rail / sidebar */}
      <aside
        className={cn('fixed inset-y-0 left-0 z-40 hidden lg:flex', panelClassName, {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        })}
      >
        <div className={cn(headerClassName, { 'justify-center px-0': isCollapsed })}>
          <Brand isCollapsed={isCollapsed} />
        </div>
        <NavList isCollapsed={isCollapsed} />
        <CollapseButton isCollapsed={isCollapsed} onClick={toggleCollapse} />
      </aside>

      {/* Mobile drawer */}
      <div className="lg:hidden" inert={!isOpen} data-testid="admin-nav-drawer">
        <button
          type="button"
          aria-label={t('nav.closeMenu')}
          onClick={toggleOpen}
          className={cn(
            'fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm transition-opacity duration-200',
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        />
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl',
            'transition-transform duration-200 ease-out',
            panelClassName,
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className={headerClassName}>
            <Brand isCollapsed={false} />
            <button
              type="button"
              onClick={toggleOpen}
              aria-label={t('nav.closeMenu')}
              className={cn(
                'rounded-lg p-2 text-neutral-500 transition-colors',
                'hover:bg-neutral-100 hover:text-neutral-900',
                'dark:hover:bg-white/10 dark:hover:text-white'
              )}
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          <NavList isCollapsed={false} />
        </div>
      </div>
    </>
  );
}

function MobileToggle() {
  const { t } = useTranslation();
  const { isOpen, toggleOpen } = useAdminNav();

  return (
    <button
      type="button"
      onClick={toggleOpen}
      aria-label={t('nav.menu')}
      aria-expanded={isOpen}
      className={cn(
        'rounded-lg p-2 text-neutral-600 transition-colors lg:hidden',
        'hover:bg-neutral-100 hover:text-neutral-900',
        'dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
      )}
    >
      <Icon name="menu" className="h-6 w-6" />
    </button>
  );
}

NavMenu.MobileToggle = MobileToggle;

export default NavMenu;
