import { appQuery } from '@highforthis/shared/web/root.graphql';
import type { AppQuery } from '@highforthis/shared/web/types/graphql';
import query from '@highforthis/shared/web/utils/query';
import { useRootData } from '@highforthis/shared/web/utils/rootData';
import titleTemplate, { type TitleProps } from '@highforthis/shared/web/utils/title';
import cn from 'classnames';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import type { LinksFunction, MetaFunction } from 'react-router';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';

import adminCss from '#/styles/admin.css?url';

import type { Route } from './+types/root';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://storage.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Bungee+Shade&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: adminCss },
  { rel: 'shortcut icon', href: `${import.meta.env.BASE_URL}favicon.png`, type: 'image/png' },
];

export const meta: MetaFunction = ({ loaderData }) => {
  return [{ title: titleTemplate(loaderData as TitleProps) }];
};

// The same query as the public site's root, so useRootData() reads the same shape in both apps
export async function loader({ request, context }: Route.LoaderArgs) {
  const data = await query<AppQuery>({ request, context, query: appQuery });
  return { data };
}

const Html = ({ children }: PropsWithChildren) => {
  const { siteSettings } = useRootData();
  return (
    <html lang={(siteSettings?.language as string) || 'en'} className="h-full">
      {children}
    </html>
  );
};

const Body = (props: HTMLAttributes<HTMLBodyElement>) => (
  <body {...props} className="h-full font-body" />
);

const Wrapper = ({ children }: PropsWithChildren) => (
  <div
    className={cn(
      'mx-auto max-w-7xl bg-white p-6 dark:bg-black',
      'transition-colors duration-300 ease-linear'
    )}
  >
    {children}
  </div>
);

export default function Root() {
  return (
    <Html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <Body>
        <Wrapper>
          <Outlet />
        </Wrapper>
        <ScrollRestoration />
        <Scripts />
      </Body>
    </Html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let message;
  if (isRouteErrorResponse(error)) {
    message = error.data || error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = 'Unknown Error';
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <title>{'Oops!'}</title>
        <Meta />
        <Links />
      </head>
      <Body>
        <Wrapper>
          <pre>{message}</pre>
        </Wrapper>
        <Scripts />
      </Body>
    </html>
  );
}
