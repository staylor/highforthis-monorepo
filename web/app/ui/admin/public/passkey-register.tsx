import { startRegistration } from '@simplewebauthn/browser';
import { clientEntry, css, navigate, on, type Handle } from 'remix/component';

import { button, wideInput } from './styles.ts';

// Asks for the registration options, runs the browser's WebAuthn prompt, sends its answer to be
// checked, then reloads the list.

interface PasskeyRegisterProps {
  optionsHref: string;
  verifyHref: string;
  labels: {
    name: string;
    namePlaceholder: string;
    button: string;
    waiting: string;
    failed: string;
  };
}

/** Posts to one of the page's JSON endpoints and throws its `error` if it has one. */
async function postJSON(href: string, failed: string, body?: unknown) {
  const response = await fetch(href, {
    method: 'POST',
    ...(body
      ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
      : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error ?? failed);
  }
  return data;
}

export const PasskeyRegister = clientEntry(
  import.meta.url,
  function PasskeyRegister(handle: Handle<PasskeyRegisterProps>) {
    let name = '';
    let error = '';
    let registering = false;

    async function register() {
      const { optionsHref, verifyHref, labels } = handle.props;
      error = '';
      registering = true;
      handle.update();
      try {
        const { challengeId, options } = await postJSON(optionsHref, labels.failed);
        const response = await startRegistration({ optionsJSON: options });
        await postJSON(verifyHref, labels.failed, {
          challengeId,
          name: name.trim() || undefined,
          response,
        });
        name = '';
        await navigate(window.location.href, { history: 'replace', resetScroll: false });
      } catch (caught) {
        error = caught instanceof Error ? caught.message : labels.failed;
      }
      registering = false;
      handle.update();
    }

    return () => {
      const { labels } = handle.props;
      return (
        <>
          <label mix={css({ marginBottom: '1rem', display: 'block' })} for="passkey-name">
            <span mix={css({ marginBottom: '0.25rem', display: 'block', fontWeight: 600 })}>
              {labels.name}
            </span>
            <input
              id="passkey-name"
              type="text"
              maxLength={100}
              placeholder={labels.namePlaceholder}
              value={name}
              mix={[
                wideInput,
                on('input', (event) => {
                  name = event.currentTarget.value;
                  handle.update();
                }),
              ]}
            />
          </label>
          <button
            type="button"
            disabled={registering}
            mix={[css(button(true)), on('click', () => register())]}
          >
            {registering ? labels.waiting : labels.button}
          </button>
          {error && <p mix={css({ marginTop: '0.75rem', color: 'var(--red-700)' })}>{error}</p>}
        </>
      );
    };
  }
);
