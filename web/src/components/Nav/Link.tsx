import cn from 'classnames';
import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router';
import type { NavLinkProps, Location } from 'react-router';

const isActive = (path: string, location: Location) => {
  if (path === location.pathname) {
    return true;
  }
  if (path === '/') {
    return false;
  }
  const initial = `/${location.pathname.split('/')[1]}`;
  if (initial === '/') {
    return false;
  }
  return path.indexOf(initial) === 0;
};

interface LinkProps extends PropsWithChildren<Pick<NavLinkProps, 'to'>> {
  isActive?: (path: string, location: Location) => boolean;
}

const Link = ({ to, children = null, isActive: isActiveProp = undefined }: LinkProps) => {
  let path;
  if (typeof to === 'string') {
    path = to;
  } else if (typeof path === 'object') {
    path = to.pathname;
  }

  const location = useLocation();
  const activeProp = isActiveProp && isActiveProp(path as string, location);
  const active = activeProp || isActive(path as string, location);
  const className = cn('text-sm font-medium tracking-wide uppercase transition-colors', {
    'text-pink dark:text-pink': active,
    'text-muted hover:text-neutral-900 dark:text-muted-dark dark:hover:text-white': !active,
  });

  return (
    <NavLink className={className} to={to}>
      {children}
    </NavLink>
  );
};

export default Link;
