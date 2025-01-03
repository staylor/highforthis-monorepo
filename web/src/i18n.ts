import { createInstance } from 'i18next';
import fs from 'i18next-fs-backend';
import { initReactI18next } from 'react-i18next';

async function createI18n(locale = 'en') {
  const instance = createInstance();

  await instance
    .use(fs)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '../locales/{{lng}}/{{ns}}.json',
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
