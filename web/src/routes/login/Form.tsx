import {
  browserSupportsWebAuthn,
  startAuthentication,
  type PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';

import Input from './Input';

interface AuthenticationOptionsResponse {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
  error?: string;
}

export default function LoginForm({ passwordLoginEnabled }: { passwordLoginEnabled: boolean }) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateWithPasskey = async () => {
    setError('');
    setIsAuthenticating(true);

    try {
      if (!browserSupportsWebAuthn()) {
        throw new Error(t('login.passkeyUnsupported'));
      }

      const optionsResponse = await fetch('/auth/passkeys/authenticate/options', {
        method: 'POST',
      });
      const data = (await optionsResponse.json()) as AuthenticationOptionsResponse;
      if (!optionsResponse.ok || data.error) {
        throw new Error(data.error ?? t('login.passkeyError'));
      }

      const response = await startAuthentication({ optionsJSON: data.options });
      await submit(
        {
          challengeId: data.challengeId,
          intent: 'passkey',
          response: JSON.stringify(response),
        },
        { method: 'post' }
      );
    } catch (authenticationError) {
      setError(
        authenticationError instanceof Error ? authenticationError.message : t('login.passkeyError')
      );
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="mt-5 block p-6 text-sm shadow-2xl">
      <button
        className="border-detail box-border w-full cursor-pointer appearance-none rounded-sm border bg-white px-3 py-2 align-baseline text-sm"
        disabled={isAuthenticating}
        onClick={authenticateWithPasskey}
        type="button"
      >
        {isAuthenticating ? t('login.passkeyWaiting') : t('login.passkeyButton')}
      </button>
      {error && <p className="mt-3 text-red-700">{error}</p>}

      {passwordLoginEnabled && (
        <>
          <div className="my-5 flex items-center gap-3 text-gray-500">
            <span className="h-px flex-1 bg-gray-300" />
            <span>{t('login.orPassword')}</span>
            <span className="h-px flex-1 bg-gray-300" />
          </div>
          <Form method="post">
            <input name="intent" type="hidden" value="password" />
            <label className="tracking-wide" htmlFor="email">
              {t('login.email')}
              <Input autoComplete="username" id="email" type="email" name="email" required />
            </label>
            <label className="tracking-wide" htmlFor="password">
              {t('login.password')}
              <Input
                autoComplete="current-password"
                id="password"
                type="password"
                name="password"
                required
              />
            </label>
            <button
              className="border-detail box-border h-7 cursor-pointer appearance-none rounded-sm border bg-white px-3 pb-0.5 align-baseline text-sm"
              type="submit"
            >
              {t('login.button')}
            </button>
          </Form>
        </>
      )}
    </div>
  );
}
