import { css, unsafeHTML, type Handle, type RemixNode } from 'remix/component';

import { sanitizeInlineHTML } from '#/lib/sanitize.ts';
import { routes } from '#/routes.ts';

import { getApp } from './app-context.tsx';
import { Link } from './link.tsx';
import { DarkMode } from './public/dark-mode.tsx';
import { MobileMenu } from './public/mobile-menu.tsx';
import { NavLink } from './public/nav-link.tsx';
import { lg, md, text } from './public/styles.ts';
import { SocialIcons } from './social-icons.tsx';

const centered = {
  marginInline: 'auto',
  maxWidth: '80rem',
  paddingInline: '1.5rem',
};

// The site's name in its title type. It's its full size from 30rem up, and below that as much of
// the width as leaves room for the menu's button, so a phone doesn't wrap it out of the header.
const logo = css({
  fontFamily: 'var(--font-title)',
  fontSize: 'clamp(1.25rem, 7.5vw, 2.25rem)',
  lineHeight: 'calc(2.5 / 2.25)',
  fontWeight: 900,
  letterSpacing: '-0.025em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

/** The bare page frame, for the error page: the site's name over what went wrong. */
export function Wrapper(handle: Handle<{ children?: RemixNode }>) {
  const { t, root } = getApp(handle);

  return () => (
    <div
      mix={css({
        display: 'flex',
        minHeight: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 1.5rem 2rem',
      })}
    >
      <Link href={routes.home.href()} mix={logo}>
        {root.siteSettings?.siteTitle || t('title')}
      </Link>
      <main mix={css({ display: 'grid', flexGrow: 1, width: '100%', placeItems: 'center' })}>
        {handle.props.children}
      </main>
    </div>
  );
}

/** The site frame: header, nav, footer. */
export function Layout(handle: Handle<{ children?: RemixNode }>) {
  const { t, root, pathname } = getApp(handle);

  return () => {
    const { siteSettings } = root;
    const links = [
      { href: routes.home.href(), label: t('nav.home') },
      { href: routes.podcast.index.href(), label: t('nav.podcast') },
      { href: routes.shows.index.href(), label: t('nav.shows') },
      { href: routes.videos.href(), label: t('nav.videos') },
    ];
    const siteTitle = siteSettings?.siteTitle || t('title');

    return (
      <div
        mix={css({
          display: 'flex',
          minHeight: '100%',
          flexDirection: 'column',
        })}
      >
        <header
          mix={css({
            position: 'sticky',
            top: 0,
            zIndex: 40,
            borderBottom:
              '1px solid light-dark(oklch(92.2% 0 none / 0.6), rgb(255 255 255 / 0.05))',
            backgroundColor: 'light-dark(rgb(255 255 255 / 0.8), rgb(10 10 10 / 0.8))',
            backdropFilter: 'blur(24px)',
          })}
        >
          <div
            mix={css({
              ...centered,
              display: 'flex',
              height: '4rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <Link href={routes.home.href()} mix={logo}>
              {siteTitle}
            </Link>

            <nav
              mix={css({
                display: 'none',
                alignItems: 'center',
                gap: '2rem',
                [lg]: { display: 'flex' },
              })}
            >
              {links.map(({ href, label }) => (
                <NavLink href={href} pathname={pathname}>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div mix={css({ display: 'flex', alignItems: 'center', gap: '1rem' })}>
              <div mix={css({ display: 'none', [lg]: { display: 'block' } })}>
                <DarkMode id="dark-mode" label={t('nav.darkMode')} />
              </div>
              <div
                mix={css({
                  display: 'none',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--muted)',
                  [lg]: { display: 'flex' },
                })}
              >
                <SocialIcons />
              </div>
              <MobileMenu
                pathname={pathname}
                links={links}
                labels={{ menu: t('nav.menu'), darkMode: t('nav.darkMode') }}
              />
            </div>
          </div>
        </header>

        <main
          mix={css({
            ...centered,
            width: '100%',
            flexGrow: 1,
            paddingBlock: '3rem',
          })}
        >
          {handle.props.children}
        </main>

        <footer
          mix={css({
            borderTop: '1px solid light-dark(var(--neutral-200), rgb(255 255 255 / 0.05))',
            backgroundColor: 'light-dark(#fff, var(--surface-dark))',
          })}
        >
          <div
            mix={css({
              ...centered,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              paddingBlock: '2.5rem',
              [md]: { flexDirection: 'row' },
            })}
          >
            <div
              mix={css({
                // On one line, as the header's is: the copyright beside it wraps instead
                flexShrink: 0,
                fontFamily: 'var(--font-title)',
                ...text['2xl'],
                fontWeight: 700,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
                color: 'light-dark(var(--neutral-300), rgb(255 255 255 / 0.3))',
              })}
            >
              {siteTitle}
            </div>
            <div
              mix={css({
                display: 'flex',
                flexShrink: 0,
                alignItems: 'center',
                gap: '1.5rem',
                color: 'var(--muted)',
              })}
            >
              <SocialIcons />
            </div>
            <div
              mix={css({
                textAlign: 'center',
                ...text.xs,
                color: 'var(--muted)',
                // The copyright text is HTML from the site settings, cut down to links and text
                '& a': { color: 'var(--pink)', textDecoration: 'underline' },
              })}
              innerHTML={unsafeHTML(sanitizeInlineHTML(siteSettings?.copyrightText ?? ''))}
            />
          </div>
        </footer>
      </div>
    );
  };
}
