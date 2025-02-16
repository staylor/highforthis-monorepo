import { createInstance } from 'i18next';
import FSBackend from 'i18next-fs-backend/cjs';
import HTTPBackend from 'i18next-http-backend/cjs';
import { initReactI18next } from 'react-i18next';

async function createI18n(locale = 'en', isServer = true) {
  const instance = createInstance();
  const Backend = isServer ? FSBackend : HTTPBackend;
  const loadPath = isServer
    ? `${process.cwd()}/public/locales/{{lng}}/{{ns}}.json`
    : '/locales/{{lng}}/{{ns}}.json';

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
