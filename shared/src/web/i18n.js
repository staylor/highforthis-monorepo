import { createInstance } from 'i18next';
import FSBackend from 'i18next-fs-backend/cjs';
import HTTPBackend from 'i18next-http-backend/cjs';
import { initReactI18next } from 'react-i18next';

/**
 * @param {string} [locale]
 * @param {boolean} [isServer] reads translations from the app's public/ folder; the browser fetches them
 * @param {string} [basePath] the app's Vite base, which the browser fetches public files under
 */
async function createI18n(locale = 'en', isServer = true, basePath = '/') {
  const instance = createInstance();
  const Backend = isServer ? FSBackend : HTTPBackend;
  const loadPath = isServer
    ? `${process.cwd()}/public/locales/{{lng}}/{{ns}}.json`
    : `${basePath}locales/{{lng}}/{{ns}}.json`;

  await instance
    .use(Backend)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath,
      },
      defaultNS: 'global',
      ns: ['global'],
      preload: [...new Set(['en', locale])],
      lng: locale,
      fallbackLng: 'en',
      showSupportNotice: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return instance;
}

export default createI18n;
