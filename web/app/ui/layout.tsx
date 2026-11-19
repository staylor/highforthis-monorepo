import { css, unsafeHTML, type Handle, type RemixNode } from 'remix/component';

import { getApp } from './app-context.tsx';
import { Link } from './link.tsx';
import { DarkMode } from './public/dark-mode.tsx';
import { MobileMenu } from './public/mobile-menu.tsx';
import { NavLink } from './public/nav-link.tsx';
import { Revalidate } from './public/revalidate.tsx';
import { lg, md, text } from './public/styles.ts';
import { AccentLine } from './section-header.tsx';
import { Sidebar } from './sidebar.tsx';
import { SocialIcons } from './social-icons.tsx';

const centered = {
  marginInline: 'auto',
  maxWidth: '80rem',
  paddingInline: '1.5rem',
};

/** The bare page frame, used for error pages. */
export function Wrapper(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div
      mix={css({
        marginInline: 'auto',
        maxWidth: '80rem',
        padding: '1.5rem',
        backgroundColor: 'light-dark(#fff, #000)',
        transition: 'color 300ms linear, background-color 300ms linear',
      })}
    >
      {handle.props.children}
    </div>
  );
}

/** The site frame: header, nav, homepage sidebar, footer. */
export function Layout(handle: Handle<{ children?: RemixNode }>) {
  const { t, root, pathname, isAuthenticated, graphqlHost } = getApp(handle);

  return () => {
    const { siteSettings, shows } = root;
    const isHome = pathname === '/';
    const siteTitle = siteSettings?.siteTitle || t('title');

    return (
      <div
        mix={css({
          display: 'flex',
          minHeight: '100%',
          flexDirection: 'column',
        })}
      >
        {isAuthenticated && <Revalidate graphqlHost={graphqlHost} />}
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
            <Link
              href="/"
              mix={css({
                fontFamily: 'var(--font-title)',
                ...text['4xl'],
                fontWeight: 900,
                letterSpacing: '-0.025em',
                textTransform: 'uppercase',
              })}
            >
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
              <NavLink href="/" pathname={pathname}>
                {t('nav.home')}
              </NavLink>
              <NavLink href="/podcast" pathname={pathname}>
                {t('nav.podcast')}
              </NavLink>
              <NavLink href="/shows" pathname={pathname}>
                {t('nav.shows')}
              </NavLink>
              <NavLink href="/videos" pathname={pathname}>
                {t('nav.videos')}
              </NavLink>
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
                labels={{
                  menu: t('nav.menu'),
                  home: t('nav.home'),
                  podcast: t('nav.podcast'),
                  shows: t('nav.shows'),
                  videos: t('nav.videos'),
                  darkMode: t('nav.darkMode'),
                }}
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
          {isHome && shows && (
            <>
              <Sidebar shows={shows} />
              <AccentLine />
            </>
          )}
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
                fontFamily: 'var(--font-title)',
                ...text['2xl'],
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'light-dark(var(--neutral-300), rgb(255 255 255 / 0.3))',
              })}
            >
              {siteTitle}
            </div>
            <div
              mix={css({
                display: 'flex',
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
                // The copyright text is HTML from the site settings
                '& a': { color: 'var(--pink)', textDecoration: 'underline' },
              })}
              innerHTML={unsafeHTML(siteSettings?.copyrightText ?? '')}
            />
          </div>
        </footer>
      </div>
    );
  };
}
