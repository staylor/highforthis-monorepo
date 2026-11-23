import { unsafeHTML, type Handle, type RemixNode } from 'remix/component';

import { stylesheetHrefs } from '#/assets.ts';
import { rumConfig } from '#/lib/rum.ts';
import { AppProvider, type AppValue } from '#/ui/app-context.tsx';
import { Layout, Wrapper } from '#/ui/layout.tsx';
import { TWITTER_USERNAME } from '#/ui/social-icons.tsx';

import { Fonts, Scripts } from './document-parts.tsx';

export interface MetaTag {
  property: string;
  content?: string | null;
}

interface Sharing {
  title: string;
  description?: string | null;
  /** The page's own address. */
  url?: string | null;
  image?: string | null;
  /** Shows the image large, as a post's is. */
  largeImage?: boolean;
}

/** How a page looks when it's shared: its title, description, address and image. */
export function sharingTags({ title, description, url, image, largeImage }: Sharing): MetaTag[] {
  return [
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:url', content: url },
    { property: 'twitter:image', content: image },
    ...(largeImage ? [{ property: 'twitter:card', content: 'summary_large_image' }] : []),
  ];
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
          <Fonts />
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
          <Scripts nonce={nonce} />
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
