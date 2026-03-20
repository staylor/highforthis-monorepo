import cn from 'classnames';
import type { HtmlHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches, useLocation } from 'react-router';

import Link from '#/components/Link';
import Navigation, { MobileMenuProvider } from '#/components/Nav';
import { AccentLine } from '#/components/SectionHeader';
import Sidebar from '#/components/Sidebar';
import useSSE from '#/hooks/useSSE';
import type { ShowConnection } from '#/types/graphql';
import { useRootData } from '#/utils/rootData';

import DarkMode from './DarkMode';
import SocialIcons from './SocialIcons';

interface RouteHandle {
  layout?: string;
}

// Find the deepest matched route that has 'layout' set on 'handle'
export const useLayout = () => {
  const matches = useMatches();
  const match = matches.reverse().find(({ handle }) => handle && (handle as RouteHandle).layout);
  return (match?.handle as RouteHandle)?.layout || 'app';
};

export const Boundary = ({ children }: PropsWithChildren) => {
  const layout = useLayout();
  return layout === 'app' ? <Layout>{children}</Layout> : <Wrapper>{children}</Wrapper>;
};

export const Html = (props: HtmlHTMLAttributes<HTMLHtmlElement>) => {
  const { siteSettings } = useRootData();
  return <html lang={siteSettings?.language as string} {...props} className="h-full" />;
};

export const Body = (props: HTMLAttributes<HTMLBodyElement>) => (
  <body {...props} className="font-body h-full" />
);

const Wrapper = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mx-auto max-w-screen-xl bg-white p-6 dark:bg-black',
      'transition-colors duration-300 ease-linear',
      className
    )}
    {...props}
  />
);

const Layout = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const { siteSettings, shows } = useRootData();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useSSE();

  return (
    <MobileMenuProvider>
      <div className="flex min-h-full flex-col">
        {/* Sticky Header */}
        <header
          className={cn(
            'sticky top-0 z-40',
            'border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl',
            'dark:bg-surface-dark/80 dark:border-white/5'
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link
              to="/"
              className="font-title hover:text-pink text-2xl font-black tracking-tight uppercase"
            >
              {siteSettings?.siteTitle || t('title')}
            </Link>

            {/* Nav (hidden on mobile, shown md+) */}
            <Navigation />

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <DarkMode />
              </div>
              <div className="text-muted dark:text-muted-dark hidden items-center gap-3 lg:flex">
                <SocialIcons />
              </div>
              <Navigation.MobileToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-7xl grow px-6 py-12">
          {/* Show the upcoming shows section on the homepage, above other content */}
          {isHome && shows && (
            <>
              <Sidebar shows={shows as ShowConnection} />
              <AccentLine />
            </>
          )}

          {children}
        </main>

        {/* Footer */}
        <footer
          className={cn(
            'border-t border-neutral-200 bg-white',
            'dark:bg-surface-dark dark:border-white/5'
          )}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
            <div className="font-title text-lg font-bold tracking-tight text-neutral-300 dark:text-white/30">
              {siteSettings?.siteTitle || t('title')}
            </div>
            <div className="text-muted dark:text-muted-dark flex items-center gap-6">
              <SocialIcons />
            </div>
            <div
              className="text-muted dark:text-muted-dark text-center text-xs"
              dangerouslySetInnerHTML={{ __html: siteSettings?.copyrightText as string }}
            />
          </div>
        </footer>
      </div>
    </MobileMenuProvider>
  );
};
