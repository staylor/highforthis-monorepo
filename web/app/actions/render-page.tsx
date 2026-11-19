import { gql } from 'graphql-tag';
import type { RemixNode } from 'remix/component';
import type { Middleware } from 'remix/router';

import { adminToken } from '../lib/adminSession.ts';
import { graphqlHost } from '../lib/graphql.ts';
import type { AppContext } from '../router.ts';
import type { AppQuery, SiteSettings } from '../types/graphql.ts';

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
      description
      feedLink
      id
      image {
        destination
        fileName
        id
      }
      title
      websiteLink
    }
    shows(first: 30, latest: true) @cache(key: "sidebar") {
      edges {
        node {
          artists {
            id
            name
            slug
          }
          date
          id
          title
          url
          venue {
            id
            name
            slug
          }
        }
      }
    }
    siteSettings {
      copyrightText
      id
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

export async function renderPage(context: AppContext, page: RemixNode, options: PageOptions = {}) {
  const root = await loadRootData(context);
  const app = {
    t: context.t,
    root,
    pathname: context.url.pathname,
    isAuthenticated: adminToken(context.request.headers.get('cookie')) !== null,
    graphqlHost,
  };
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
    { status: options.status }
  );
}
