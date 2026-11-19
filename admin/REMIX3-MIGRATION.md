# Moving the admin to Remix 3

Status as of 2026-11-18, against Remix `3.2.0` (still the latest release). This replaces the admin parts of the trial report (`web-remix/REMIX3-TRIAL.md` on the `explore/remix-3` branch). That trial ported the public site, which has since shipped. The web parts of that report are now history.

## Summary

The public site in `web/` has run on Remix 3 since #45. The admin is still a React Router 8 app in `admin/`. Web proxies the admin onto the same domain. Since the trial, the work that didn't depend on Remix has been done in the React admin (#49 to #54), so what's left is mostly rewriting the UI.

**Recommendation:** move the admin into web one section at a time, through the proxy web already has, rather than rewriting it in one go or building a separate Remix admin app. Web forwards `/admin` to the admin service today. A section moves by adding its routes to web and no longer forwarding its paths. The admin's cookie, its server functions and the end-to-end suite all keep working across the split, so each section can ship on its own. The end state is one service: the admin's Railway service, the proxy and the forwarded-host workarounds (#47, #48, #52) all go away.

**Size:** about 6,000 lines of React UI to rewrite, roughly a third of it the shared admin UI (forms, list table, nav, pickers). About 2,000 lines of server functions and 750 lines of editor core carry over unchanged.

## Done since the trial

| PR | What it took off the migration |
| --- | --- |
| #49 | The post editor runs on core Lexical. Its logic is in framework-free modules (`components/Editor/core/`), and `@lexical/react` is gone. Only three small React views remain. |
| #50 | Every route's data logic is a plain server function in `src/server/` that takes a GraphQL client and `FormData`. None of them import React Router, and they have 11 test files of their own. |
| #51 | No CommonJS in browser code (`classnames`, `lodash.debounce` replaced). List deletes are POSTs with `intent=delete`. |
| #52 | Failed deletes show an error. On Railway, web trusts the edge's forwarded headers, so admin redirects stay on https. |
| #53 | The list table's row and bulk delete forms are plain forms. Bulk actions apply with a button, not on change. |
| #54 | A Playwright suite (6 specs, 8 tests) drives the admin through web's URL and runs on PRs. Failed saves come back with `?saveFailed=1`. |
| Lexical 0.53 | The editor imports `CodeNode` from `@lexical/code-core`, so Prism, which the asset server can't serve, is gone. Image and video nodes are block-level, which Lexical 0.53 needs to load saved posts unchanged. |

## The admin today

**Routes:** 34 under `/admin`, plus `/login/:error?` and two picker routes, `/modals/media/:type/:cursor?` and `/modals/video/:cursor?`. See `src/routes.ts`.

| Section | Routes | Route code | Server functions | Notes |
| --- | --- | --- | --- | --- |
| Users | list, add, edit | ~100 lines | 84 | Plain CRUD |
| Artists | list, add, edit | ~100 | 152 | Inline "exclude from search" toggle |
| Venues | list, add, edit | ~115 | 156 | Two inline toggles |
| Podcast | list, add, edit | ~110 | 106 | |
| Videos | list, edit | ~130 | 83 | List filters |
| Settings | site, media, podcast | ~150 | 117 | Image crop sizes editor (`Settings/Crops.tsx`) |
| Passkeys | list, options, verify | ~170 | 72 | WebAuthn registration in the browser |
| Shows | list, add, edit, bulk, listings | ~550 | 213 | "Attended" toggle, CSV bulk add, venue listings page |
| Media | list, upload, album covers, edit | ~390 | 170 | File upload, album cover fetching |
| Posts | list, add, edit | ~115 | 88 | The editor and both pickers |
| Login | sign in, sign out | ~220 | (`auth.ts`) | Password and passkey sign-in; writes the session cookie |

**Shared admin UI:** forms (`Admin/Form`, ~500 lines), list table (~460), nav menu (~650), pickers (`Admin/Modals`, ~310), editor views (~190).

**Browser behavior:** 33 component and route files hold state or event handlers. In Remix those become client entries (`clientEntry`), and everything else renders on the server. Grouped:

- **Editor:** `Editor/index.tsx`, `InlineToolbar.tsx`, `BlockToolbar.tsx`, hosting the core modules.
- **Pickers:** `Admin/Modals/Media.tsx`, `Video.tsx` (infinite scroll), opened from `Admin/Form/FeaturedMedia`.
- **Inline toggles:** `Entity/ExcludeFromSearch`, `Venue/PermanentlyClosed`, the show list's "attended" box. They post with `useFetcher` today.
- **Form widgets:** `Form/EditableField`, `Form/Tags`, `Form/Date`, `Show/SelectEntities`, `Entity/Shows`, `Settings/Crops`, `Textarea` (auto-resize).
- **List table:** select-all checkboxes and the debounced search box.
- **Nav:** collapse and mobile drawer (`NavMenu`).
- **Pages:** media upload, album covers, show listings (`useNavigation` pending state), passkey registration, passkey sign-in (`login/Form.tsx`).
- **Not really islands:** `Form/Input`, `Select` and `Checkbox` only pass `onChange` through, and `Message`'s dismiss button can be a link.

**Translations:** 68 `useTranslation` calls in 61 files, all reading `public/locales/en/global.json`. There are no `<Trans>` components.

**Tests:** 181 tests in 30 files. The 11 `src/server` test files test framework-free code and carry over. The component tests (Testing Library, including 5 snapshot files) get rewritten with their components. The e2e suite is the acceptance test.

## Migration path: section by section through web's proxy

### How the split works

`web/app/router.ts` runs `proxies()` before rendering, and `web/app/middleware/app.ts` forwards `/admin`, `/auth/passkeys`, `/login`, `/modals` and `/upload` to the admin service. Moving a section means adding its routes to web's `routes.ts` and changing the forwarding rule so that section's paths aren't forwarded, for example by checking a list of migrated prefixes before `/admin`. Links between migrated and unmigrated pages are ordinary same-origin links, and web's Navigation API client navigation handles them either way.

### Sessions: nobody needs to be signed out

The admin's session cookie (`TOKEN_KEY`, signed with `TOKEN_SECRET`) holds only the user's `token`. Web already verifies that cookie format and reads the token (`web/app/lib/adminSession.ts`), and both services use the same secret, because admin's `TOKEN_SECRET` is a Railway reference to web's. So:

- Migrated pages read the token with `adminToken()` and pass it to GraphQL. They never need to write the session.
- Login and logout stay in the React Router admin until the last step.
- When login moves, web can write the same signed format: base64 JSON plus an unpadded base64 HMAC-SHA256, the mirror of `verify()`. Sessions survive the cutover, unlike the switch to Remix's own cookie format the trial assumed. Moving to `remix/session` can come later, as a separate change.

### Protection that React Router gave for free

- **Admin check:** React Router's admin layout redirected signed-out users. In web, add a `requireAdmin()` controller middleware that checks the token against GraphQL's `/auth/session`, like `admin/src/utils/adminSession.server.ts`. List it on **every** admin controller, because controller middleware doesn't flow into nested route maps (from the trial). GraphQL still enforces admin access on every mutation either way.
- **CSRF:** React Router compared each action's `Origin` with the request host. Web needs the same for admin POSTs, either with `remix/middleware/csrf`, which expects Remix's session middleware, or a small origin-check middleware until sessions move.

### Foundations before the first section

1. An admin document shell in web: layout, nav and messages. The trial's `app/actions/admin/shell.tsx` is a start.
2. Admin styles built by the Tailwind CLI, as web's are (the trial built `admin.css` the same way), plus the admin's translations loaded into web's `i18next`.
3. A GraphQL client that sends the admin token. The admin's server functions take one, so they can move into web (or a shared workspace) as-is, with their tests and GraphQL documents. Web's codegen then needs to cover those documents.
4. `requireAdmin()` and the origin check.
5. The forwarding rule with an exclusion list.

### Order

1. **Users, then artists and venues:** plain list and edit forms prove the foundations. The inline toggles become small client entries that post a form.
2. **Podcast, videos, settings:** more forms, video list filters, and the crops editor.
3. **Shows:** the bulk CSV page and the listings page are the largest route files.
4. **Media:** upload, album covers, and the pickers.
5. **Posts:** the editor client entry, the featured media field, and both pickers.
6. **Login and passkeys:** move sign-in, write the session cookie from web, stop forwarding, then retire the admin service, its Railway variables and web's `ADMIN_HOST`.

Run the e2e suite after each step. It drives everything through web's URL, so it tests both halves throughout.

## Area by area

- **Routing and data:** each React Router `loader`/`action` pair is now a thin wrapper around `src/server` functions, so it becomes a controller action that calls the same function and renders or redirects. Admin URLs can stay the same. `:id?` becomes `(/:id)`.
- **Forms:** all admin forms already POST plain fields, and list deletes post `intent=delete`. Remix submits native forms itself, so React Router's `<Form>` becomes `<form>`.
- **Messages after saves and deletes:** `?message=updated`, `?deleted=N`, `?deleteFailed=N` and `?saveFailed=1` are URL parameters, not session flashes, so they need no session.
- **Inline toggles:** each becomes a client entry that posts a small form (or `fetch`) and re-renders. These are the simplest client entries in the admin.
- **Pickers:** the `/modals/*` routes already return the picker's data per cursor. Remix frames (`<Frame>`, see the "Streaming UI with Frames" guide) load another route's HTML into the page and reload it in place, which fits a picker. The alternative is a client entry that fetches the next page.
- **Editor:** `core/editor.ts`, `inlineToolbar.ts` and `blockToolbar.ts` have no React. Their stores currently feed React through `useSyncExternalStore`. In Remix, a client entry subscribes and calls `handle.update()`. The trial's spike (`app/actions/admin/post/public/post-editor.tsx` on `explore/remix-3`) shows core Lexical binding to a `contenteditable` from a `ref()` mixin. Image and video nodes already render their own DOM.
- **Uploads:** the admin's Express middleware adds the session token to `/upload` requests before proxying them to GraphQL. Web's `remix/fetch-proxy` can do the same; the trial kept that injection.
- **Passkeys and login:** ported in the trial (`app/actions/login/`, `app/actions/admin/passkeys/`), with `@simplewebauthn/browser` served unbundled.
- **Translations:** `react-i18next` doesn't apply. Server components read `t` from context, as web's do, and client entries get their strings as props.
- **Browser packages:** web's `assets.ts` serves only packages in `allowPackages`, and under pnpm each must be a direct dependency of web. On Lexical 0.53 the editor needs `lexical`, `@lexical/rich-text`, `list`, `history`, `selection`, `utils` and `code-core`, and their dependencies `@lexical/clipboard`, `dragon`, `extension`, `html` and `a11y`, plus `@preact/signals-core` at the version `@lexical/extension` asks for (`^1.14.4`), so the browser doesn't get an older copy from web. `@lexical/internal` is build-time only and isn't needed.
- **Code blocks and Prism (spiked, resolved):** `@lexical/code` 0.41 imported `prismjs` and 15 Prism language files for their side effects. The asset server rejects Prism (`CommonJS module detected: …/prismjs/prism.js`), and any page with the editor then fails to load. Since 0.42, Lexical ships `CodeNode` in `@lexical/code-core`, which has no Prism; highlighting lives in the separate `@lexical/code-prism`, which the admin doesn't use. The admin now runs Lexical 0.53 and imports from `@lexical/code-core`. A spike page in web confirmed that a code block loads, edits and saves (as `"type": "code"`, keeping its language) through the asset server, in development and production, with Prism never loaded. If highlighting is ever wanted, it would need Prism served as a prebuilt bundle, as #46 did for OpenObserve.
- **Lexical's dev and prod builds:** each Lexical package's entry imports both its `.dev` and `.prod` builds and picks one at runtime. With no bundler, a production editor page downloaded both: 78 Lexical files, and a 43 KB import map with 128 entries. The compiler folds `process.env.NODE_ENV` but keeps `import "./Lexical.dev.js"` as a side effect. A `scripts.loaders` entry in `assets.ts` that removes those imports in production brings it to 52 files (124 KB compressed) and a 35 KB import map. Adding a `production` resolution condition doesn't help, because the asset server resolves packages with fixed conditions. Only pages with the editor pay this; the public site's import map is unaffected.
- **Express server:** goes away with the admin service. Compression, static files and proxying are already in web, and the `trust proxy` / forwarded-host middleware (#47, #48) has no proxy hop left to correct.

## Remix 3 gaps that still apply

- **Reconciler bug:** an empty-string slot that becomes an element is appended at the end of its parent instead of in place (`{text && <p/>}` with `text = ''`). It still affects 3.2.0, so client entries should use ternaries. Repro on `explore/remix-3`: `/dev/slots`.
- **Form data typing:** action-level `formData()` middleware doesn't add `context.formData` to the handler's type. Web works around it with router-level middleware.
- **Unfinished docs:** the "Auth, Sessions, and Security" and "Errors and Cancellation" guides are still outlines in 3.2.0. The middleware READMEs have working examples.
- **Tests:** `remix/test` has no snapshot matcher, and interactive component tests need Playwright (`*.test.browser.tsx`).
- **Packages that pick their build at runtime:** the asset server serves both builds of a package whose entry imports its dev and prod builds and chooses one, as Lexical's do. It needs a loader to drop the dev import (see "Lexical's dev and prod builds").

## Open questions

- Whether the admin's server functions move into web or into a shared workspace. Web is the only consumer once the admin service is gone.
- Whether the server function tests stay on vitest or move to `remix test`.
- When to switch the session to `remix/session`: after the move, with one sign-out, or never.
- Whether to report the reconciler bug upstream before starting.
