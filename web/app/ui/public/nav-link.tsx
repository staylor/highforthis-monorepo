import { css, type Handle, type RemixNode } from 'remix/component';

import { colorTransition, text } from './styles.ts';

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

const navLinkStyle = css({
  ...text.sm,
  fontWeight: 500,
  letterSpacing: '0.025em',
  textTransform: 'uppercase',
  ...colorTransition,
  color: 'var(--muted)',
  '&:hover': { color: 'light-dark(var(--neutral-900), #fff)' },
  '&[aria-current="page"]': { color: 'var(--pink)' },
});

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
        mix={navLinkStyle}
      >
        {children}
      </a>
    );
  };
}
