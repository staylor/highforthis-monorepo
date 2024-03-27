import cn from 'classnames';
import { useLocation, NavLink as RRNavLink } from '@remix-run/react';

import type { AdminTopLevelRoute } from '@/types';

interface NavLinkProps {
  isHovered: boolean;
  isCollapsed: boolean;
  hasSubNav: boolean;
  item: AdminTopLevelRoute;
}

function NavLink({ item, isCollapsed, isHovered, hasSubNav }: NavLinkProps) {
  const location = useLocation();
  const adminPath = item.path === '/' ? '/admin' : `/admin${item.path}`;
  const isActive =
    adminPath === location.pathname ||
    (adminPath !== '/admin' && location.pathname.indexOf(adminPath) === 0);
  const className = cn(
    'block box-border relative no-underline text-sm py-2 min-h-[36px] z-30',
    {
      'bg-dark text-white': isActive,
      'bg-white text-black': !isActive && isHovered,
      'visited:bg-dark visited:text-white': isActive,
      'active:bg-dark active:text-white': isActive,
      'hover:bg-dark hover:text-white': isActive,
    },
    'after:h-0 after:pointer-events-none after:absolute after:right-0 after:w-0 after:z-top after:top-1/2',
    'after:border-4 after:border-transparent lg:after:border-0 after:-mt-1 lg:after:mt-0',
    {
      'after:border-r-white': isActive,
      'after:border-r-dark': isHovered && hasSubNav,
      'after:border-8 lg:after:border-8 after:-mt-2 lg:after:-mt-2': !isCollapsed,
      'after:border-4 lg:after:border-4 after:-mt-1 lg:after:-mt-1': isCollapsed,
    },
    {
      'after:border-r-white': isActive && isHovered && hasSubNav,
      'after:border-r-dark': isActive && isHovered && hasSubNav && isCollapsed,
    }
  );
  return (
    <RRNavLink to={adminPath} className={className}>
      {item.dashicon && (
        <i
          className={cn(
            'float-left block h-9 w-9 text-center',
            { 'text-white': isActive },
            `dashicons-before dashicons-${item.dashicon}`
          )}
        />
      )}
      <span className={cn({ hidden: isCollapsed })}>{item.label}</span>
    </RRNavLink>
  );
}

export default NavLink;
