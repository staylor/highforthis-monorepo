import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';
import { clientEntry, on, ref, type Handle } from 'remix/component';

// The button asks GraphQL for the options (web forwards /auth/passkeys to it), runs the
// browser's WebAuthn prompt, then posts the answer with a hidden form, which the sign-in action
// checks.

interface PasskeyLoginProps {
  action: string;
  labels: { button: string; waiting: string; unsupported: string; failed: string };
}

export const PasskeyLogin = clientEntry(
  import.meta.url,
  function PasskeyLogin(handle: Handle<PasskeyLoginProps>) {
    let error = '';
    let authenticating = false;
    let form: HTMLFormElement | undefined;

    async function authenticate(signal: AbortSignal) {
      const { labels } = handle.props;
      error = '';
      authenticating = true;
      handle.update();
      try {
        if (!browserSupportsWebAuthn()) {
          throw new Error(labels.unsupported);
        }
        const optionsResponse = await fetch('/auth/passkeys/authenticate/options', {
          method: 'POST',
          signal,
        });
        const data = await optionsResponse.json();
        if (!optionsResponse.ok || data.error) {
          throw new Error(data.error ?? labels.failed);
        }
        const response = await startAuthentication({ optionsJSON: data.options });
        if (signal.aborted || !form) {
          return;
        }
        (form.elements.namedItem('challengeId') as HTMLInputElement).value = data.challengeId;
        (form.elements.namedItem('response') as HTMLInputElement).value = JSON.stringify(response);
        form.requestSubmit();
      } catch (caught) {
        if (signal.aborted) {
          return;
        }
        error = caught instanceof Error ? caught.message : labels.failed;
        authenticating = false;
        handle.update();
      }
    }

    return () => {
      const { action, labels } = handle.props;
      return (
        <>
          <button
            type="button"
            disabled={authenticating}
            class="box-border w-full cursor-pointer appearance-none rounded-sm border border-detail bg-white px-3 py-2 align-baseline text-sm"
            mix={on('click', (_event, signal) => authenticate(signal))}
          >
            {authenticating ? labels.waiting : labels.button}
          </button>
          {error && <p class="mt-3 text-red-700">{error}</p>}
          <form
            method="post"
            action={action}
            hidden
            mix={ref((node) => {
              form = node;
            })}
          >
            <input type="hidden" name="intent" value="passkey" />
            <input type="hidden" name="challengeId" />
            <input type="hidden" name="response" />
          </form>
        </>
      );
    };
  }
);
