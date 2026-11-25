import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import { getApp } from '#/ui/app-context.tsx';
import { colorTransition, text } from '#/ui/public/styles.ts';

// A tab bar: the links sit on a line, and the page that's open underlines its own in pink
const bar = css({
  display: 'flex',
  gap: '1.5rem',
  borderBottom: '1px solid light-dark(var(--neutral-200), rgb(255 255 255 / 0.08))',
});

// Set like the header's links, which these are a level under
const tab = css({
  marginBottom: -1,
  borderBottom: '2px solid transparent',
  paddingBottom: '0.625rem',
  ...text.sm,
  fontWeight: 500,
  letterSpacing: '0.025em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  ...colorTransition,
  '&:hover': { color: 'light-dark(var(--neutral-900), #fff)' },
  '&[aria-current="page"]': { borderBottomColor: 'var(--pink)', color: 'var(--pink)' },
});

/** The shows' pages: what's coming up, what we've been to, and who and where we've seen most. */
export function ShowsNav(handle: Handle) {
  const { t, pathname } = getApp(handle);

  return () => {
    const calendar = routes.shows.index.href();
    const history = routes.shows.history.href();
    const pages = [
      { href: calendar, label: t('shows.nav.calendar'), current: pathname === calendar },
      { href: history, label: t('shows.nav.history'), current: pathname.startsWith(history) },
      {
        href: routes.shows.stats.href({ entity: 'artist' }),
        label: t('shows.nav.stats'),
        current: pathname.startsWith('/shows/stats/'),
      },
    ];
    return (
      <nav aria-label={t('shows.nav.label')} mix={bar}>
        {pages.map(({ href, label, current }) => (
          <a
            href={href}
            aria-current={current ? 'page' : undefined}
            data-rmx-prefetch="intent"
            mix={tab}
          >
            {label}
          </a>
        ))}
      </nav>
    );
  };
}
