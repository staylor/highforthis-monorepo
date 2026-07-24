import { startRegistration } from '@simplewebauthn/browser';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActionFunctionArgs, AppLoadContext, LoaderFunctionArgs } from 'react-router';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router';

import { Heading1, Heading2 } from '#/components/Heading';

import { passkeyApi } from './server';
import type {
  PasskeyListResponse,
  RegistrationOptionsResponse,
  RegistrationVerificationRequest,
} from './types';

export async function loader({ request, context }: LoaderFunctionArgs) {
  return passkeyApi<PasskeyListResponse>({
    request,
    context: context as AppLoadContext,
    path: '',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentialId = formData.get('credentialId');
  if (typeof credentialId !== 'string') {
    throw new Error('Passkey ID is required');
  }

  await passkeyApi({
    request,
    context: context as AppLoadContext,
    path: `/${encodeURIComponent(credentialId)}`,
    init: { method: 'DELETE' },
  });

  return { deleted: true };
}

export default function Passkeys() {
  const { passkeys } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const deleteFetcher = useFetcher();
  const revalidator = useRevalidator();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const register = async () => {
    setError('');
    setIsRegistering(true);

    try {
      const optionsResponse = await fetch('/admin/passkeys/options', { method: 'POST' });
      const optionsData = (await optionsResponse.json()) as RegistrationOptionsResponse & {
        error?: string;
      };
      if (!optionsResponse.ok || optionsData.error) {
        throw new Error(optionsData.error ?? t('passkeys.registrationError'));
      }

      const response = await startRegistration({ optionsJSON: optionsData.options });
      const verification: RegistrationVerificationRequest = {
        challengeId: optionsData.challengeId,
        name: name.trim() || undefined,
        response,
      };
      const verificationResponse = await fetch('/admin/passkeys/verify', {
        method: 'POST',
        body: JSON.stringify(verification),
        headers: { 'Content-Type': 'application/json' },
      });
      const verificationData = (await verificationResponse.json()) as { error?: string };
      if (!verificationResponse.ok || verificationData.error) {
        throw new Error(verificationData.error ?? t('passkeys.registrationError'));
      }

      setName('');
      await revalidator.revalidate();
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : t('passkeys.registrationError')
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Heading1>{t('passkeys.heading')}</Heading1>
      <p className="mb-6">{t('passkeys.description')}</p>

      <section className="mb-10 rounded-sm border border-gray-200 p-5">
        <Heading2>{t('passkeys.addHeading')}</Heading2>
        <label className="mb-4 block" htmlFor="passkey-name">
          <span className="mb-1 block font-semibold">{t('passkeys.name')}</span>
          <input
            className="w-full rounded-sm border border-gray-300 p-2"
            id="passkey-name"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('passkeys.namePlaceholder')}
            type="text"
            value={name}
          />
        </label>
        <button
          className="border-detail cursor-pointer rounded-sm border bg-white px-4 py-2"
          disabled={isRegistering}
          onClick={register}
          type="button"
        >
          {isRegistering ? t('passkeys.waiting') : t('passkeys.addButton')}
        </button>
        {error && <p className="mt-3 text-red-700">{error}</p>}
      </section>

      <section>
        <Heading2>{t('passkeys.registeredHeading')}</Heading2>
        {passkeys.length === 0 ? (
          <p>{t('passkeys.none')}</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-sm border border-gray-200">
            {passkeys.map((passkey) => (
              <li className="flex items-center justify-between gap-5 p-4" key={passkey.id}>
                <div>
                  <strong className="block">{passkey.name || t('passkeys.unnamed')}</strong>
                  <span className="block text-sm text-gray-600">
                    {t('passkeys.created', { date: passkey.createdAt.slice(0, 10) })}
                  </span>
                  <span className="block text-sm text-gray-600">
                    {passkey.lastUsedAt
                      ? t('passkeys.lastUsed', { date: passkey.lastUsedAt.slice(0, 10) })
                      : t('passkeys.neverUsed')}
                  </span>
                  {passkey.backedUp && (
                    <span className="block text-sm text-gray-600">{t('passkeys.synced')}</span>
                  )}
                </div>
                <deleteFetcher.Form
                  method="post"
                  onSubmit={(event) => {
                    if (!window.confirm(t('passkeys.removeConfirm'))) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="credentialId" type="hidden" value={passkey.id} />
                  <button
                    className="cursor-pointer rounded-sm border border-red-700 bg-white px-3 py-2 text-red-700"
                    disabled={deleteFetcher.state !== 'idle'}
                    type="submit"
                  >
                    {t('passkeys.remove')}
                  </button>
                </deleteFetcher.Form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
