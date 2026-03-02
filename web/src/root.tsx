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

import mainStylesheetUrl from '#/styles/main.css?url';

import type { Route } from './+types/root';
import { isAuthenticated } from './auth';
import { Html, Body, Boundary, useLayout } from './components/Layout';
import { TWITTER_USERNAME } from './constants';
import { appQuery } from './root.graphql';
import type { AppQuery } from './types/graphql';
import { createClientCache } from './utils/cache';
import query from './utils/query';
import titleTemplate, { type TitleProps } from './utils/title';

export const links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://storage.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
    },
    { rel: 'shortcut icon', href: '/favicon.png', type: 'image/png' },
    { rel: 'stylesheet', href: '/fonts/icons/icons.css' },
  ];
};

export const meta: MetaFunction = ({ data }) => {
  return [{ title: titleTemplate(data as TitleProps) }];
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await isAuthenticated(request);
  const data = await query<AppQuery>({ request, context, query: appQuery });
  return {
    data,
    isAuthenticated: Boolean(user),
    graphqlHost: context.graphqlHost,
  };
}

export const clientLoader = createClientCache();

const AppLinks = ({ data }: { data: AppQuery }) => {
  const { podcastSettings, dashboardSettings } = data;
  return (
    <>
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      {podcastSettings.feedLink && podcastSettings.title && (
        <link
          rel="alternate"
          type="application/rss+xml"
          href={podcastSettings.feedLink}
          title={podcastSettings.title}
        />
      )}
      {dashboardSettings.googleTrackingId && (
        <>
          <script
            suppressHydrationWarning
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${dashboardSettings.googleTrackingId}`}
          />
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${dashboardSettings.googleTrackingId}');`,
            }}
          />
        </>
      )}
    </>
  );
};

export default function Root({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;
  const layout = useLayout();
  return (
    <Html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta property="twitter:site" content={`@${TWITTER_USERNAME}`} />
        <meta property="twitter:creator" content={`@${TWITTER_USERNAME}`} />
        <Meta />
        <Links />
        {layout !== 'admin' && <link rel="stylesheet" href={mainStylesheetUrl} />}
        {layout === 'app' && <AppLinks data={data} />}
      </head>
      <Body>
        <Boundary>
          <Outlet />
        </Boundary>
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
    <Html>
      <head>
        <meta charSet="utf-8" />
        <title>{'Oops!'}</title>
        <Meta />
        <Links />
        <link rel="stylesheet" href={mainStylesheetUrl} />
      </head>
      <Body>
        <Boundary>
          <pre>{message}</pre>
        </Boundary>
        <Scripts />
      </Body>
    </Html>
  );
}
