import { unsafeHTML, type Handle, type RemixNode } from 'remix/component';
import { ImportMap } from 'remix/component/server';

import { scriptEntry, stylesheetHrefs } from '../../assets.ts';
import { AdminProvider, type AdminValue } from '../../ui/admin/context.tsx';
import { AdminShell } from '../../ui/admin/shell.tsx';

interface AdminDocumentProps {
  admin: AdminValue;
  title: string;
  /** Leaves out the nav, for signing in. */
  bare?: boolean;
  children?: RemixNode;
}

// Runs before first paint so dark mode doesn't flash
const darkModeScript = `try{if(localStorage.getItem('darkMode'))document.documentElement.classList.add('dark')}catch(e){}`;

/** No RUM: page views count public pages only. */
export function AdminDocument(handle: Handle<AdminDocumentProps>) {
  return () => {
    const { admin, title, bare, children } = handle.props;
    const { href, importMap, preloads } = scriptEntry;

    return (
      <html lang="en" data-rmx-preserve-attrs="class">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="robots" content="noindex" />
          <title>{title}</title>
          <script innerHTML={unsafeHTML(darkModeScript)} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Bungee+Shade&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          />
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
          {stylesheetHrefs.admin.map((stylesheetHref) => (
            <link key={stylesheetHref} rel="stylesheet" href={stylesheetHref} />
          ))}
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href}></script>
        </head>
        <body>
          <AdminProvider value={admin}>
            {bare ? children : <AdminShell>{children}</AdminShell>}
          </AdminProvider>
        </body>
      </html>
    );
  };
}
