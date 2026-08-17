import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { HydratedRouter } from 'react-router/dom';

import createI18n from './i18n.js';

async function startOpenObserveRum() {
  const config = window.__OPENOBSERVE_RUM__;
  if (!config) {
    return;
  }

  try {
    const { initializeOpenObserveRum } = await import('./rum.client');
    initializeOpenObserveRum(config);
  } catch (error) {
    console.error('OpenObserve RUM failed to initialize', error);
  }
}

(async () => {
  const [i18n] = await Promise.all([createI18n('en', false), startOpenObserveRum()]);

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <HydratedRouter />
        </I18nextProvider>
      </StrictMode>
    );
  });
})();
