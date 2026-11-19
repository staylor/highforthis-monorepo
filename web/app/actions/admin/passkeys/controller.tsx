import { css } from 'remix/component';
import { createRedirectResponse } from 'remix/response/redirect';
import { createAction, createController } from 'remix/router';

import { getAdminT } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import { Heading } from '../../../ui/admin/page.tsx';
import { ConfirmButton } from '../../../ui/admin/public/confirm-button.tsx';
import { PasskeyRegister } from '../../../ui/admin/public/passkey-register.tsx';
import { dark, lg, text, type Styles } from '../../../ui/public/styles.ts';
import { renderAdminPage } from '../render-page.tsx';

import { deletePasskey, listPasskeys, passkeyApi } from './data.ts';

// Adding a passkey happens in the browser, through the options and verify endpoints.

const passkeys = routes.admin.passkeys;

const heading2 = css({
  marginBottom: '0.5rem',
  display: 'block',
  ...text['2xl'],
  fontWeight: 700,
  [lg]: { marginBottom: '0.75rem' },
  [dark]: { color: '#fff' },
});
const muted = css({
  display: 'block',
  ...text.sm,
  color: 'var(--neutral-600)',
  [dark]: { color: 'var(--neutral-400)' },
});
const box = {
  borderRadius: '0.25rem',
  border: '1px solid var(--neutral-200)',
  [dark]: { borderColor: 'rgb(255 255 255 / 0.1)' },
} satisfies Styles;
const lightText = css({ [dark]: { color: 'var(--neutral-300)' } });

// A passkey, with a line between it and the next
const passkeyRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.25rem',
  padding: '1rem',
  '& + &': {
    borderTop: '1px solid var(--neutral-200)',
    [dark]: { borderColor: 'rgb(255 255 255 / 0.1)' },
  },
});

export const passkeysList = createController(passkeys.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { passkeys: registered } = await listPasskeys(context.admin.token);
      return renderAdminPage(
        context,
        <div mix={css({ maxWidth: '48rem' })}>
          <Heading>{t('passkeys.heading')}</Heading>
          <p mix={[lightText, css({ marginBottom: '1.5rem' })]}>{t('passkeys.description')}</p>

          <section mix={css({ ...box, marginBottom: '2.5rem', padding: '1.25rem' })}>
            <h2 mix={heading2}>{t('passkeys.addHeading')}</h2>
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
            <h2 mix={heading2}>{t('passkeys.registeredHeading')}</h2>
            {registered.length === 0 ? (
              <p mix={lightText}>{t('passkeys.none')}</p>
            ) : (
              <ul mix={css(box)}>
                {registered.map((passkey) => (
                  <li key={passkey.id} mix={passkeyRow}>
                    <div>
                      <strong mix={css({ display: 'block', [dark]: { color: '#fff' } })}>
                        {passkey.name || t('passkeys.unnamed')}
                      </strong>
                      <span mix={muted}>
                        {t('passkeys.created', { date: passkey.createdAt.slice(0, 10) })}
                      </span>
                      <span mix={muted}>
                        {passkey.lastUsedAt
                          ? t('passkeys.lastUsed', { date: passkey.lastUsedAt.slice(0, 10) })
                          : t('passkeys.neverUsed')}
                      </span>
                      {passkey.backedUp && <span mix={muted}>{t('passkeys.synced')}</span>}
                    </div>
                    <form method="post">
                      <input type="hidden" name="credentialId" value={passkey.id} />
                      <ConfirmButton
                        label={t('passkeys.remove')}
                        confirm={t('passkeys.removeConfirm')}
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
