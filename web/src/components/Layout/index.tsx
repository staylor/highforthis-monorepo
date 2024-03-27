import cn from 'classnames';
import type { HtmlHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';
import { useMatches } from '@remix-run/react';

import { SITE_TITLE } from '@/constants';
import Link from '@/components/Link';
import Navigation from '@/components/Nav';
import Sidebar from '@/components/Sidebar';
import type { ShowConnection } from '@/types/graphql';
import { useRootData } from '@/utils/rootData';

import SocialIcons from './SocialIcons';
import DarkMode from './DarkMode';

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
  <body {...props} className="h-full" />
);

export const Wrapper = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mx-auto max-w-screen-xl bg-white p-6 dark:bg-black',
      'transition-colors duration-300 ease-linear',
      className
    )}
    {...props}
  />
);

export const Layout = ({ children }: PropsWithChildren) => {
  const { siteSettings, shows } = useRootData();

  const social = <SocialIcons />;
  return (
    <Wrapper className="lg:my-6">
      <header className="relative md:mb-6">
        <div className="md:flex md:justify-between">
          <h1 className="text-center font-stylized text-4xl font-bold xs:text-5xl lg:text-left lg:text-7xl">
            <Link to="/">{siteSettings?.siteTitle || SITE_TITLE}</Link>
          </h1>
          <div className="right-0 top-6 flex items-center justify-center lg:absolute lg:flex-none">
            <DarkMode />
            <nav className="mt-1.5 text-center">{social}</nav>
          </div>
        </div>
        <Navigation />
      </header>
      <div className="my-8 justify-between md:my-0 lg:flex">
        <section className="mb-12 grow lg:mr-12">{children}</section>
        <section>
          <Sidebar shows={shows as ShowConnection} />
        </section>
      </div>
      <nav className="my-2.5 text-center">{social}</nav>
      <footer className="overflow-hidden text-center text-sm">
        <section dangerouslySetInnerHTML={{ __html: siteSettings?.copyrightText as string }} />
      </footer>
    </Wrapper>
  );
};
