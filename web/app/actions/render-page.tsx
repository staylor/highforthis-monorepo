import { gql } from 'graphql-tag';
import type { RemixNode } from 'remix/component';
import type { Middleware } from 'remix/router';

import { adminToken } from '#/lib/adminSession.ts';
import type { AppContext } from '#/router.ts';
import type { AppQuery, SiteSettings } from '#/types/graphql.ts';

import { Document, type MetaTag } from './document.tsx';

const SITE_TITLE = 'High for This';
const SITE_TAGLINE = 'Music as it happens.';

export function titleTemplate(title: string | undefined | null, siteSettings?: SiteSettings) {
  const template = `%s » ${siteSettings?.siteTitle || SITE_TITLE}`;
  return template.replace('%s', title || siteSettings?.tagline || SITE_TAGLINE);
}

const appQuery = gql`
  query App {
    apiKeys {
      googleMaps
    }
    podcastSettings {
      id
      description
      feedLink
      title
      websiteLink
      image {
        id
        destination
        fileName
      }
    }
    shows(first: 30, latest: true) @cache(key: "sidebar") {
      edges {
        node {
          id
          date
          title
          url
          artists {
            id
            name
            slug
          }
          venue {
            id
            name
            slug
          }
        }
      }
    }
    siteSettings {
      id
      copyrightText
      language
      siteTitle
      siteUrl
      tagline
    }
  }
`;

// One App query per request, shared by the prefetch middleware and the page. Keyed by the
// request rather than stored on the context, so any controller's context can use it, whatever
// its middleware has added.
const rootData = new WeakMap<Request, Promise<AppQuery>>();

/** Page actions share one memoized App query per request. */
export function loadRootData(context: Pick<AppContext, 'gql' | 'request'>): Promise<AppQuery> {
  let data = rootData.get(context.request);
  if (!data) {
    data = context.gql.query<AppQuery>(appQuery);
    rootData.set(context.request, data);
  }
  return data;
}

/** Controller middleware that starts the App query before the action runs its own. */
export function prefetchRootData(): Middleware {
  return (context, next) => {
    void loadRootData(context as unknown as AppContext);
    return next();
  };
}

interface PageOptions {
  title?: string | null;
  meta?: MetaTag[];
  head?: RemixNode;
  layout?: 'app' | 'bare';
  status?: number;
}

/**
 * Links prefetch their page on hover or press, but Remix discards the HTML and the click fetches
 * it again, so every click rendered the page twice. Caching it briefly lets the click reuse the
 * prefetch. A signed-in admin's pages aren't cached, so they show edits right away, and with
 * Vary: Cookie, pages cached before signing in or out aren't reused after.
 */
const reusable = { 'Cache-Control': 'private, max-age=30', Vary: 'Cookie' };

export async function renderPage(context: AppContext, page: RemixNode, options: PageOptions = {}) {
  const root = await loadRootData(context);
  const app = { t: context.t, root, pathname: context.url.pathname };
  const signedIn = (await adminToken(context.request.headers.get('cookie'))) !== null;
  const status = options.status ?? 200;
  return context.render(
    <Document
      app={app}
      title={titleTemplate(options.title, root.siteSettings)}
      meta={options.meta}
      head={options.head}
      layout={options.layout}
    >
      {page}
    </Document>,
    { status, headers: status === 200 && !signedIn ? reusable : undefined }
  );
}
