import cn from 'classnames';
import { useLocation, NavLink } from '@remix-run/react';

import type { AdminTopLevelRoute } from '@/types';

interface SubNavProps {
  isHovered: boolean;
  isCollapsed: boolean;
  item: AdminTopLevelRoute;
}

function SubNav({ isHovered, isCollapsed, item }: SubNavProps) {
  const location = useLocation();
  const adminPath = item.path === '/' ? '/admin' : `/admin${item.path}`;
  const active = location.pathname.indexOf(adminPath) === 0;

  const flyout = isCollapsed ? isHovered : isHovered && !active;
  const isHidden = isCollapsed ? !flyout : !isHovered && !active;
  return (
    <nav
      className={cn('py-2', isHidden ? 'hidden' : 'block', {
        'left-9 lg:left-9': isCollapsed,
        'left-9 lg:left-40': !isCollapsed,
        'bg-white': !flyout,
        'z-top bg-dark min-w-nav absolute top-0 block w-auto shadow-md': flyout,
      })}
    >
      {item.routes?.map((route) => {
        const itemPath = `/admin${route.path}`;
        const isRoute = location.pathname === itemPath;
        const className = cn(
          'block text-[13px] tracking-wide no-underline py-1 px-3',
          // these colors can't co-exist
          flyout
            ? 'text-white visited:text-white'
            : active
              ? 'text-black hover:text-black active:text-black'
              : 'text-dark',
          {
            'font-bold': active && isRoute,
            'hover:text-pink active:text-pink': !isRoute || flyout,
          }
        );
        return (
          <NavLink className={className} key={itemPath} to={itemPath}>
            {route.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default SubNav;
