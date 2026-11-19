import { startRegistration } from '@simplewebauthn/browser';
import { clientEntry, navigate, on, ref, type Handle } from 'remix/component';

import { buttonClass, inputBase } from './styles.ts';

// Asks for the registration options, runs the browser's WebAuthn prompt, sends its answer to be
// checked, then reloads the list. The name field is read when the button is pressed, so a name
// typed before the page's scripts load is kept.

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
    let nameInput: HTMLInputElement | undefined;
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
          name: nameInput?.value.trim() || undefined,
          response,
        });
        if (nameInput) {
          nameInput.value = '';
        }
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
          <label class="mb-4 block" for="passkey-name">
            <span class="mb-1 block font-semibold">{labels.name}</span>
            <input
              id="passkey-name"
              type="text"
              maxLength={100}
              placeholder={labels.namePlaceholder}
              class={`${inputBase} w-full`}
              mix={ref((node) => {
                nameInput = node;
              })}
            />
          </label>
          <button
            type="button"
            disabled={registering}
            class={buttonClass(true)}
            mix={on('click', () => register())}
          >
            {registering ? labels.waiting : labels.button}
          </button>
          {error && <p class="mt-3 text-red-700">{error}</p>}
        </>
      );
    };
  }
);
