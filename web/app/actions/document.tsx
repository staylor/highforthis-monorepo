import { unsafeHTML, type Handle, type RemixNode } from 'remix/component';
import { ImportMap } from 'remix/component/server';

import { scriptEntry, stylesheetHrefs } from '#/assets.ts';
import { rumConfig } from '#/lib/rum.ts';
import { AppProvider, type AppValue } from '#/ui/app-context.tsx';
import { Layout, Wrapper } from '#/ui/layout.tsx';
import { TWITTER_USERNAME } from '#/ui/social-icons.tsx';

export interface MetaTag {
  property: string;
  content?: string | null;
}

interface DocumentProps {
  app: AppValue;
  title: string;
  meta?: MetaTag[];
  head?: RemixNode;
  layout?: 'app' | 'bare';
  /** The response's nonce, which the page's policy lets inline scripts run with. */
  nonce?: string;
  children?: RemixNode;
}

// Runs before first paint so dark mode doesn't flash.
const darkModeScript = `try{if(localStorage.getItem('darkMode'))document.documentElement.classList.add('dark')}catch(e){}`;

/** The <html> shell, <head> links and meta, and the layout choice. */
export function Document(handle: Handle<DocumentProps>) {
  return () => {
    const { app, title, meta = [], head, layout = 'app', nonce, children } = handle.props;
    const { podcastSettings, siteSettings } = app.root;
    const { href, importMap, preloads } = scriptEntry;

    return (
      <html lang={siteSettings?.language || 'en'} data-rmx-preserve-attrs="class">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta property="twitter:site" content={`@${TWITTER_USERNAME}`} />
          <meta property="twitter:creator" content={`@${TWITTER_USERNAME}`} />
          <title>{title}</title>
          {meta
            .filter((tag) => tag.content)
            .map((tag) => (
              <meta property={tag.property} content={tag.content!} />
            ))}
          <script nonce={nonce} innerHTML={unsafeHTML(darkModeScript)} />
          {rumConfig && (
            <script
              nonce={nonce}
              innerHTML={unsafeHTML(
                `window.__OPENOBSERVE_RUM__=${JSON.stringify(rumConfig).replace(/</g, '\\u003c')};`
              )}
            />
          )}
          <link rel="preconnect" href="https://storage.googleapis.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Bungee+Shade&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          />
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
          {stylesheetHrefs.site.map((stylesheetHref) => (
            <link key={stylesheetHref} rel="stylesheet" href={stylesheetHref} />
          ))}
          {layout === 'app' && podcastSettings?.feedLink && podcastSettings.title && (
            <link
              rel="alternate"
              type="application/rss+xml"
              href={podcastSettings.feedLink}
              title={podcastSettings.title}
            />
          )}
          {head}
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href} nonce={nonce}></script>
        </head>
        <body>
          <AppProvider value={app}>
            {layout === 'app' ? <Layout>{children}</Layout> : <Wrapper>{children}</Wrapper>}
          </AppProvider>
        </body>
      </html>
    );
  };
}
