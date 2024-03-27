import cn from 'classnames';
import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from '@remix-run/react';
import type { NavLinkProps, Location } from '@remix-run/react';

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
  const className = cn(
    'font-stylized text-base xs:text-xl sm:text-2xl md:text-3xl align-middle inline-block',
    'my-1 mx-1 xs:mx-1.5 md:mx-2.5 first:ml-0 last:mr-0 md:my-0 md:ml-0 md:mr-5',
    {
      'text-pink dark:text-pink': active,
      'text-gray-400 dark:text-gray-400': !active,
    }
  );

  return (
    <NavLink className={className} to={to}>
      {children}
    </NavLink>
  );
};

export default Link;
