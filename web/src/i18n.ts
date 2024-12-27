import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import global from './locales/en/global.json';

const instance = createInstance();

instance.use(initReactI18next).init({
  debug: true,
  defaultNS: 'global',
  ns: ['global'],
  resources: {
    en: {
      global,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default instance;
