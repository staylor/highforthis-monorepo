import { css } from 'remix/component';
import { createRedirectResponse } from 'remix/response/redirect';
import { createAction, createController } from 'remix/router';

import { renderAdminPage } from '#/actions/admin/render-page.tsx';
import { loadRootData } from '#/actions/render-page.tsx';
import { adminSessionCookie, adminToken, expiredAdminCookie } from '#/lib/adminSession.ts';
import { clientAddress } from '#/lib/client.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { signInAttempts } from '#/lib/rate-limits.ts';
import { sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import { PasskeyLogin } from '#/ui/admin/public/passkey-login.tsx';
import { text } from '#/ui/public/styles.ts';

import { passwordLoginEnabled, signIn, signOut } from './sign-in.ts';

// Big fields that lift when focused
const input = css({
  margin: '0.125rem 0.375rem 1.25rem 0',
  boxSizing: 'border-box',
  width: '100%',
  borderRadius: '0.25rem',
  border: '1px solid var(--gray-300)',
  backgroundColor: 'var(--gray-50)',
  padding: '0.5rem',
  ...text['2xl'],
  boxShadow: 'var(--shadow-xs)',
  outline: '2px solid transparent',
  outlineOffset: '2px',
  transition: 'all 150ms var(--ease)',
  '&:focus': { borderColor: 'var(--gray-400)', boxShadow: 'var(--shadow-lg)' },
});

const button = css({
  boxSizing: 'border-box',
  height: '1.75rem',
  cursor: 'pointer',
  appearance: 'none',
  borderRadius: '0.25rem',
  border: '1px solid var(--detail)',
  backgroundColor: '#fff',
  padding: '0 0.75rem 0.125rem',
  verticalAlign: 'baseline',
  ...text.sm,
});

const rule = css({ height: 1, flex: '1 1 0%', backgroundColor: 'var(--gray-300)' });
const fieldLabel = css({ letterSpacing: '0.025em' });

function errorMessage(t: TFunction, error?: string) {
  switch (error) {
    case 'unauthorized':
      return t('login.unauthorized');
    case 'failed':
      return t('login.failed');
    case 'throttled':
      return t('login.throttled');
    default:
      return undefined;
  }
}

export const login = createController(routes.login, {
  middleware: [sameOrigin()],
  actions: {
    async index(context) {
      // Someone signed in goes on to the admin. requireAdmin() checks the token with GraphQL, and
      // sends them back here with the session removed if it's no longer good.
      if (await adminToken(context.request.headers.get('cookie'))) {
        return createRedirectResponse(routes.admin.dashboard.href());
      }
      const t = getAdminT();
      const { siteSettings } = await loadRootData(context);
      const error = errorMessage(t, context.params.error);
      const action = routes.login.action.href({});

      return renderAdminPage(
        context,
        <div mix={css({ display: 'block', minHeight: '100vh' })}>
          <div mix={css({ margin: 'auto', width: '20rem', paddingTop: '8%' })}>
            <h1
              mix={css({
                marginBottom: '1.25rem',
                display: 'block',
                fontSize: '3rem',
                lineHeight: 1,
                fontWeight: 900,
              })}
            >
              {siteSettings?.siteTitle || t('title')}
            </h1>
            {error && (
              <p
                role="alert"
                mix={css({
                  marginBottom: '1rem',
                  borderLeft: '4px solid var(--pink)',
                  backgroundColor: 'rgb(229 0 130 / 0.1)',
                  padding: '0.5rem 0.75rem',
                  ...text.sm,
                  color: 'var(--neutral-900)',
                })}
              >
                {error}
              </p>
            )}
            <div
              mix={css({
                marginTop: '1.25rem',
                display: 'block',
                padding: '1.5rem',
                ...text.sm,
                boxShadow: 'var(--shadow-2xl)',
              })}
            >
              <PasskeyLogin
                action={action}
                labels={{
                  button: t('login.passkeyButton'),
                  waiting: t('login.passkeyWaiting'),
                  unsupported: t('login.passkeyUnsupported'),
                  failed: t('login.passkeyError'),
                }}
              />
              {passwordLoginEnabled() && (
                <>
                  <div
                    mix={css({
                      marginBlock: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'var(--gray-500)',
                    })}
                  >
                    <span mix={rule} />
                    <span>{t('login.orPassword')}</span>
                    <span mix={rule} />
                  </div>
                  <form method="post" action={action}>
                    <input type="hidden" name="intent" value="password" />
                    <label mix={fieldLabel} for="email">
                      {t('login.email')}
                      <input
                        mix={input}
                        autoComplete="username"
                        id="email"
                        type="email"
                        name="email"
                        required
                      />
                    </label>
                    <label mix={fieldLabel} for="password">
                      {t('login.password')}
                      <input
                        mix={input}
                        autoComplete="current-password"
                        id="password"
                        type="password"
                        name="password"
                        required
                      />
                    </label>
                    <button mix={button} type="submit">
                      {t('login.button')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>,
        { title: t('login.button'), bare: true }
      );
    },

    async action(context) {
      // Each address gets a few tries, by password or passkey, before it has to wait
      const address = clientAddress(context.request);
      if (address && !signInAttempts.attempt(address)) {
        return createRedirectResponse(routes.login.index.href({ error: 'throttled' }), 303);
      }
      const result = await signIn(await context.request.formData());
      if ('error' in result) {
        return createRedirectResponse(routes.login.index.href({ error: result.error }), 303);
      }
      return createRedirectResponse(routes.admin.dashboard.href(), {
        status: 303,
        headers: { 'Set-Cookie': await adminSessionCookie(result.token) },
      });
    },
  },
});

/**
 * Signing out is a post, so a link on another site can't do it. It ends the token in GraphQL as
 * well as removing the cookie.
 */
export const logout = createAction(routes.admin.logout, {
  middleware: [sameOrigin()],
  async handler(context) {
    const token = await adminToken(context.request.headers.get('cookie'));
    if (token) {
      await signOut(token);
    }
    return createRedirectResponse(routes.login.index.href({}), {
      status: 303,
      headers: { 'Set-Cookie': await expiredAdminCookie() },
    });
  },
});
