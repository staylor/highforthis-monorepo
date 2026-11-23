import { readFileSync } from 'node:fs';

import { createInstance, type TFunction } from 'i18next';

// i18next runs on the server, and translated strings reach hydrated components as props. The
// site's strings are beside this file, and the admin's in admin/.
const global = JSON.parse(readFileSync(new URL('./strings.en.json', import.meta.url), 'utf8'));

const i18n = createInstance();
await i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'global',
  ns: ['global'],
  resources: { en: { global } },
  interpolation: { escapeValue: false },
});

export type { TFunction };

export function getT(locale = 'en'): TFunction {
  return i18n.getFixedT(locale);
}

/** Admin strings load on first use, so public pages never read them. */
export function getAdminT(locale = 'en'): TFunction {
  if (!i18n.hasResourceBundle('en', 'admin')) {
    const strings = JSON.parse(
      readFileSync(new URL('./admin/strings.en.json', import.meta.url), 'utf8')
    );
    i18n.addResourceBundle('en', 'admin', strings);
  }
  return i18n.getFixedT(locale, 'admin');
}
