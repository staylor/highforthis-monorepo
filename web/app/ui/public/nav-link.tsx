import type { Handle, RemixNode } from 'remix/component';

import { cn } from './cn.ts';

const showsPattern = /^\/(shows|venue|artist)/;

function isActive(path: string, pathname: string) {
  if (path === '/shows' && showsPattern.test(pathname)) {
    return true;
  }
  if (path === pathname) {
    return true;
  }
  if (path === '/') {
    return false;
  }
  const initial = `/${pathname.split('/')[1]}`;
  if (initial === '/') {
    return false;
  }
  return path.indexOf(initial) === 0;
}

/** A nav link, active when its href matches the pathname prop. */
export function NavLink(handle: Handle<{ href: string; pathname: string; children?: RemixNode }>) {
  return () => {
    const { href, pathname, children } = handle.props;
    const active = isActive(href, pathname);
    return (
      <a
        href={href}
        data-rmx-prefetch="intent"
        aria-current={active ? 'page' : undefined}
        class={cn('text-sm font-medium tracking-wide uppercase transition-colors', {
          'text-pink dark:text-pink': active,
          'text-muted hover:text-neutral-900 dark:text-muted-dark dark:hover:text-white': !active,
        })}
      >
        {children}
      </a>
    );
  };
}
