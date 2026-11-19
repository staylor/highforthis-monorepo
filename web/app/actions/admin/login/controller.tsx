import { createRedirectResponse } from 'remix/response/redirect';
import { createAction, createController } from 'remix/router';

import { adminSessionCookie, adminToken, expiredAdminCookie } from '../../../lib/adminSession.ts';
import { getAdminT, type TFunction } from '../../../lib/i18n.ts';
import { sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import { PasskeyLogin } from '../../../ui/admin/public/passkey-login.tsx';
import { loadRootData } from '../../render-page.tsx';
import { renderAdminPage } from '../render-page.tsx';

import { passwordLoginEnabled, signIn } from './sign-in.ts';

// Signing in and out, moved from the admin app's routes/login and routes/admin/logout.

const inputClass =
  'mt-0.5 mr-1.5 mb-5 box-border w-full rounded-sm border border-gray-300 bg-gray-50 p-2 text-2xl shadow-xs outline-hidden transition focus:border-gray-400 focus:shadow-lg';
const buttonClass =
  'box-border h-7 cursor-pointer appearance-none rounded-sm border border-detail bg-white px-3 pb-0.5 align-baseline text-sm';

/** The message for the page's error segment, such as /login/unauthorized. */
function errorMessage(t: TFunction, error?: string) {
  switch (error) {
    case 'unauthorized':
      return t('login.unauthorized');
    case 'failed':
      return t('login.failed');
    case 'required':
      return t('login.required');
    default:
      return undefined;
  }
}

export const login = createController(routes.login, {
  middleware: [sameOrigin()],
  actions: {
    async index(context) {
      // Someone signed in goes on to the admin, as before. requireAdmin() checks the token with
      // GraphQL, and sends them back here with the session removed if it's no longer good.
      if (adminToken(context.request.headers.get('cookie'))) {
        return createRedirectResponse(routes.admin.dashboard.href());
      }
      const t = getAdminT();
      const { siteSettings } = await loadRootData(context);
      const error = errorMessage(t, context.params.error);
      const action = routes.login.action.href({});

      return renderAdminPage(
        context,
        <div class="block min-h-screen">
          <div class="m-auto w-80 pt-[8%]">
            <h1 class="mb-5 block text-5xl font-black">{siteSettings?.siteTitle || t('title')}</h1>
            {error && (
              <p
                role="alert"
                class="mb-4 border-l-4 border-pink bg-pink/10 px-3 py-2 text-sm text-neutral-900"
              >
                {error}
              </p>
            )}
            <div class="mt-5 block p-6 text-sm shadow-2xl">
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
                  <div class="my-5 flex items-center gap-3 text-gray-500">
                    <span class="h-px flex-1 bg-gray-300" />
                    <span>{t('login.orPassword')}</span>
                    <span class="h-px flex-1 bg-gray-300" />
                  </div>
                  <form method="post" action={action}>
                    <input type="hidden" name="intent" value="password" />
                    <label class="tracking-wide" for="email">
                      {t('login.email')}
                      <input
                        class={inputClass}
                        autoComplete="username"
                        id="email"
                        type="email"
                        name="email"
                        required
                      />
                    </label>
                    <label class="tracking-wide" for="password">
                      {t('login.password')}
                      <input
                        class={inputClass}
                        autoComplete="current-password"
                        id="password"
                        type="password"
                        name="password"
                        required
                      />
                    </label>
                    <button class={buttonClass} type="submit">
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
      const token = await signIn(await context.request.formData());
      if (!token) {
        return createRedirectResponse(routes.login.index.href({ error: 'failed' }), 303);
      }
      return createRedirectResponse(routes.admin.dashboard.href(), {
        status: 303,
        headers: { 'Set-Cookie': adminSessionCookie(token) },
      });
    },
  },
});

/** Signs out: removes the session and goes back to the sign-in page. */
export const logout = createAction(routes.admin.logout, {
  handler() {
    return createRedirectResponse(routes.login.index.href({}), {
      headers: { 'Set-Cookie': expiredAdminCookie() },
    });
  },
});
