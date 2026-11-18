import { unsafeHTML, type Handle, type RemixNode } from 'remix/component';

import { getApp } from './app-context.tsx';
import { Link } from './link.tsx';
import { cn } from './public/cn.ts';
import { DarkMode } from './public/dark-mode.tsx';
import { MobileMenu } from './public/mobile-menu.tsx';
import { NavLink } from './public/nav-link.tsx';
import { Revalidate } from './public/revalidate.tsx';
import { AccentLine } from './section-header.tsx';
import { Sidebar } from './sidebar.tsx';
import { SocialIcons } from './social-icons.tsx';

/** The bare page frame, used for error pages. */
export function Wrapper(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div
      class={cn(
        'mx-auto max-w-7xl bg-white p-6 dark:bg-black',
        'transition-colors duration-300 ease-linear'
      )}
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
      <div class="flex min-h-full flex-col">
        {isAuthenticated && <Revalidate graphqlHost={graphqlHost} />}
        <header
          class={cn(
            'sticky top-0 z-40',
            'border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl',
            'dark:bg-surface-dark/80 dark:border-white/5'
          )}
        >
          <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link
              href="/"
              class="font-title text-4xl font-black tracking-tight uppercase hover:text-pink"
            >
              {siteTitle}
            </Link>

            <nav class="hidden items-center gap-8 lg:flex">
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

            <div class="flex items-center gap-4">
              <div class="hidden lg:block">
                <DarkMode id="dark-mode" label={t('nav.darkMode')} />
              </div>
              <div class="hidden items-center gap-3 text-muted lg:flex dark:text-muted-dark">
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

        <main class="mx-auto w-full max-w-7xl grow px-6 py-12">
          {isHome && shows && (
            <>
              <Sidebar shows={shows} />
              <AccentLine />
            </>
          )}
          {handle.props.children}
        </main>

        <footer
          class={cn(
            'border-t border-neutral-200 bg-white',
            'dark:bg-surface-dark dark:border-white/5'
          )}
        >
          <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
            <div class="font-title text-2xl font-bold tracking-tight text-neutral-300 dark:text-white/30">
              {siteTitle}
            </div>
            <div class="flex items-center gap-6 text-muted dark:text-muted-dark">
              <SocialIcons />
            </div>
            <div
              class="text-center text-xs text-muted dark:text-muted-dark"
              innerHTML={unsafeHTML(siteSettings?.copyrightText ?? '')}
            />
          </div>
        </footer>
      </div>
    );
  };
}
