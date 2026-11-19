import { createRedirectResponse } from 'remix/response/redirect';
import { createAction, createController } from 'remix/router';

import { getAdminT } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import { Heading } from '../../../ui/admin/page.tsx';
import { ConfirmButton } from '../../../ui/admin/public/confirm-button.tsx';
import { PasskeyRegister } from '../../../ui/admin/public/passkey-register.tsx';
import { cn } from '../../../ui/public/cn.ts';
import { renderAdminPage } from '../render-page.tsx';

import { deletePasskey, listPasskeys, passkeyApi } from './data.ts';

// The signed-in admin's passkeys: the list, removing one, and adding one, which the browser does
// through the options and verify endpoints. Moved from the admin app's routes/admin/passkeys.

const passkeys = routes.admin.passkeys;

const heading2 = 'mb-2 block text-2xl font-bold lg:mb-3 dark:text-white';
const muted = 'block text-sm text-neutral-600 dark:text-neutral-400';
const box = 'rounded-sm border border-neutral-200 dark:border-white/10';

export const passkeysList = createController(passkeys.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { passkeys: registered } = await listPasskeys(context.admin.token);
      return renderAdminPage(
        context,
        <div class="max-w-3xl">
          <Heading>{t('passkeys.heading')}</Heading>
          <p class="mb-6 dark:text-neutral-300">{t('passkeys.description')}</p>

          <section class={cn(box, 'mb-10 p-5')}>
            <h2 class={heading2}>{t('passkeys.addHeading')}</h2>
            <PasskeyRegister
              optionsHref={passkeys.options.href()}
              verifyHref={passkeys.verify.href()}
              labels={{
                name: t('passkeys.name'),
                namePlaceholder: t('passkeys.namePlaceholder'),
                button: t('passkeys.addButton'),
                waiting: t('passkeys.waiting'),
                failed: t('passkeys.registrationError'),
              }}
            />
          </section>

          <section>
            <h2 class={heading2}>{t('passkeys.registeredHeading')}</h2>
            {registered.length === 0 ? (
              <p class="dark:text-neutral-300">{t('passkeys.none')}</p>
            ) : (
              <ul class={cn(box, 'divide-y divide-neutral-200 dark:divide-white/10')}>
                {registered.map((passkey) => (
                  <li key={passkey.id} class="flex items-center justify-between gap-5 p-4">
                    <div>
                      <strong class="block dark:text-white">
                        {passkey.name || t('passkeys.unnamed')}
                      </strong>
                      <span class={muted}>
                        {t('passkeys.created', { date: passkey.createdAt.slice(0, 10) })}
                      </span>
                      <span class={muted}>
                        {passkey.lastUsedAt
                          ? t('passkeys.lastUsed', { date: passkey.lastUsedAt.slice(0, 10) })
                          : t('passkeys.neverUsed')}
                      </span>
                      {passkey.backedUp && <span class={muted}>{t('passkeys.synced')}</span>}
                    </div>
                    <form method="post">
                      <input type="hidden" name="credentialId" value={passkey.id} />
                      <ConfirmButton
                        label={t('passkeys.remove')}
                        confirm={t('passkeys.removeConfirm')}
                        class="cursor-pointer rounded-sm border border-red-700 bg-white px-3 py-2 text-red-700"
                      />
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>,
        { title: t('passkeys.heading') }
      );
    },

    // The remove buttons' forms
    async action(context) {
      await deletePasskey(context.admin.token, await context.request.formData());
      return createRedirectResponse(passkeys.list.index.href(), 303);
    },
  },
});

/** GraphQL's answer, passed on to the browser as it is. */
function passOn(response: Response) {
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'private, no-store',
    },
  });
}

/** Starts adding a passkey: the options the browser's WebAuthn call needs. */
export const passkeyOptions = createAction(passkeys.options, {
  middleware: [sameOrigin(), requireAdmin()],
  async handler(context) {
    return passOn(await passkeyApi(context.admin.token, '/register/options', { method: 'POST' }));
  },
});

/** Finishes adding a passkey with the browser's answer. */
export const passkeyVerify = createAction(passkeys.verify, {
  middleware: [sameOrigin(), requireAdmin()],
  async handler(context) {
    return passOn(
      await passkeyApi(context.admin.token, '/register/verify', {
        method: 'POST',
        body: await context.request.text(),
      })
    );
  },
});
