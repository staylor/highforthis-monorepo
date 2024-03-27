import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
} from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

import mainStylesheetUrl from '@/styles/main.css';

import { Html, Body, Boundary, useLayout } from './components/Layout';
import { TWITTER_USERNAME } from './constants';
import query from './utils/query';
import titleTemplate, { type TitleProps } from './utils/title';
import { appQuery } from './root.graphql';
import type { AppQuery } from './types/graphql';
import { createClientCache } from './utils/cache';

export const links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://static.highforthis.com' },
    { rel: 'preconnect', href: 'https://use.typekit.net' },
    { rel: 'shortcut icon', href: '/favicon.png', type: 'image/png' },
    { rel: 'stylesheet', href: 'https://use.typekit.net/tts4dcv.css' },
    { rel: 'stylesheet', href: '/fonts/icons/icons.css' },
  ];
};
export const meta: MetaFunction = ({ data }) => {
  return [{ title: titleTemplate(data as TitleProps) }];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  return query({ request, context, query: appQuery });
};

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
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${dashboardSettings.googleTrackingId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${dashboardSettings.googleTrackingId}');`,
            }}
          />
        </>
      )}
    </>
  );
};

export default function Root() {
  const layout = useLayout();
  const data = useLoaderData<AppQuery>();
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
        {layout === 'app' && <AppLinks data={data as AppQuery} />}
      </head>
      <Body>
        <Boundary>
          <Outlet />
        </Boundary>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
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
        <title>Oops!</title>
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
