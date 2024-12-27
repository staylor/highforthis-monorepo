import { I18nextProvider } from 'react-i18next';
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

import mainStylesheetUrl from '~/styles/main.css?url';

import type { Route } from './+types/root';
import { Html, Body, Boundary, useLayout } from './components/Layout';
import { TWITTER_USERNAME } from './constants';
import i18n from './i18n';
import { appQuery } from './root.graphql';
import type { AppQuery } from './types/graphql';
import { createClientCache } from './utils/cache';
import query from './utils/query';
import titleTemplate, { type TitleProps } from './utils/title';

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

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<AppQuery>({ request, context, query: appQuery });
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
  const layout = useLayout();
  return (
    <I18nextProvider i18n={i18n}>
      <Html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta property="twitter:site" content={`@${TWITTER_USERNAME}`} />
          <meta property="twitter:creator" content={`@${TWITTER_USERNAME}`} />
          <Meta />
          <Links />
          {layout !== 'admin' && <link rel="stylesheet" href={mainStylesheetUrl} />}
          {layout === 'app' && <AppLinks data={loaderData} />}
        </head>
        <Body>
          <Boundary>
            <Outlet />
          </Boundary>
          <ScrollRestoration />
          <Scripts />
        </Body>
      </Html>
    </I18nextProvider>
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
