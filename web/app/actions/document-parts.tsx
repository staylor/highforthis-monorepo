import type { Handle } from 'remix/component';
import { ImportMap } from 'remix/component/server';

import { scriptEntry } from '#/assets.ts';

// What the site's document and the admin's both have in their <head>.

/** The fonts, from Google, and the favicon. */
export function Fonts() {
  return () => (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bungee+Shade&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
      />
      <link rel="shortcut icon" href="/favicon.png" type="image/png" />
    </>
  );
}

/**
 * The browser entry, which hydrates the page's client entries: its import map, the modules to
 * preload, and the entry itself. `nonce` is the response's, which the page's policy lets the
 * entry run with; Remix gives the import map its own.
 */
export function Scripts(handle: Handle<{ nonce?: string }>) {
  const { href, importMap, preloads } = scriptEntry;
  return () => (
    <>
      <ImportMap value={importMap} />
      {preloads.map((preloadHref) => (
        <link key={preloadHref} rel="modulepreload" href={preloadHref} />
      ))}
      <script type="module" src={href} nonce={handle.props.nonce}></script>
    </>
  );
}
