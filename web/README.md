# @highforthis/web

The public High For This site and its admin, built with [Remix 3](https://github.com/remix-run/remix). This server forwards the API (`/graphql`) and the start of a passkey sign-in (`/auth/passkeys/authenticate/options`) to GraphQL, so passkeys belong to the site's domain. It forwards media uploads (`/upload`) too, adding the admin's token from the session cookie, which the upload page can't read.

Remix 3 has no bundler. The server renders every page, the browser runtime turns same-origin links into client navigations, and the few interactive parts (dark mode, the mobile menu, video thumbnails, the sphere setlists) hydrate as client entries. The asset server compiles browser modules on request and serves them unbundled through an import map, fingerprinted in production.

## Stack

- **[Remix 3](https://github.com/remix-run/remix)**: routing, server rendering, client entries and the asset server
- **CSS** from Remix's `css()` mixin in components, which renders each page's rules into its `<head>`, and a few plain stylesheets in `app/styles/public/` (see [Styles](#styles))
- **GraphQL** through a small `fetch` client (`app/lib/graphql.ts`), on the server only: each request gets its own, so there's no cache to keep. An operation that fails is logged and thrown, so a page whose query fails answers 500. Only the query every page shares (`loadRootData`) is optional, and pages render without it.
- **[i18next](https://www.i18next.com/)**, on the server, with the site's strings in `app/lib/strings.en.json`; client entries get translated strings as props
- **OpenObserve browser RUM**, which records page views for the admin dashboard

## Development

`pnpm dev` from the monorepo root starts GraphQL and web. The site is at http://localhost:3000, and the admin at http://localhost:3000/admin.

```bash
pnpm web:dev   # just this app
```

`pnpm dev` restarts the server on changes. `pnpm hmr` (in this folder) also hot-reloads server and browser modules.

### Environment Variables

| Variable | Description |
| --- | --- |
| `SERVER_PORT` | Web server port (default: `3000`; Railway's `PORT` wins) |
| `GQL_HOST` | GraphQL server URL (default: `http://localhost:8081`) |
| `TOKEN_KEY` | Admin session cookie name (default: `__session`) |
| `TOKEN_SECRET` | Admin session cookie secret; required in production and on Railway (development and tests have a default) |
| `PASSWORD_LOGIN_ENABLED` | Set to `false` to sign in with passkeys only; must match `graphql` |
| `SIGN_IN_RATE_LIMITS` | Set to `off` to stop limiting sign-ins per address, as the end-to-end tests do |
| `OPENOBSERVE_URL`, `OPENOBSERVE_USER`, `OPENOBSERVE_PASSWORD` | OpenObserve's address and credentials, for the admin dashboard's page views |
| `OPENOBSERVE_ORG` | OpenObserve organization the dashboard searches (default: `default`) |
| `OPENOBSERVE_RUM_APPLICATION_ID` | OpenObserve RUM application ID; setting any required RUM variable enables browser monitoring |
| `OPENOBSERVE_RUM_CLIENT_TOKEN` | Browser ingestion token from OpenObserve's RUM setup (this token is intentionally sent to browsers) |
| `OPENOBSERVE_RUM_SITE` | OpenObserve host or URL, such as `https://openobserve.example.com` |
| `OPENOBSERVE_RUM_ORGANIZATION_IDENTIFIER` | OpenObserve organization (default: `default`) |
| `OPENOBSERVE_RUM_SESSION_SAMPLE_RATE` | Percentage of sessions monitored (default: `100`) |
| `OPENOBSERVE_RUM_REPLAY_SAMPLE_RATE` | Percentage of sessions recorded for replay; use `0` to disable replay (default: `20`) |
| `OPENOBSERVE_RUM_TRACE_SAMPLE_RATE` | Percentage of same-origin requests correlated with backend traces (default: `100`) |
| `OPENOBSERVE_RUM_SERVICE` | RUM service name (default: `web`) |
| `OPENOBSERVE_RUM_ENVIRONMENT` | Deployment environment (defaults to the Railway environment or `NODE_ENV`) |
| `OPENOBSERVE_RUM_VERSION` | Deployed version (defaults to the Railway Git SHA) |

Signing in keeps the admin's GraphQL token in a cookie signed with `remix/cookie` (`app/lib/adminSession.ts`), for 12 hours. Public pages only read it to know someone is signed in: an admin's pages aren't cached, so they show edits right away.

### Admin pages

Signing in is at `/login`, and the admin's pages are under `/admin`.

- Admin controllers list `sameOrigin()` and `requireAdmin()` (`app/middleware/admin.ts`). They reject cross-site form posts and require an admin session GraphQL accepts, which then sits on `context.admin` with a GraphQL client that sends the token.
- `renderAdminPage()` (`app/actions/admin/render-page.tsx`) renders a page in the admin's document and layout, from `app/ui/admin/`.
- Each section's controllers share their actions from the same module: `listAction()` handles a list's deletes and its rows' boxes, and `formActions()` an add or edit page and its form's post. Lists show their rows with `ListTable`, `TitleCell` and `toggleColumn()` (`app/ui/admin/list-table.tsx`), and forms pick uploads with `mediaField()` (`app/actions/admin/media/field.tsx`).
- Forms save through `submitForm()` (`app/lib/admin/forms.ts`). Each form's data module lists its text fields, which stay strings and are sent as null when emptied. A save that fails renders the form's page again with what was submitted and, when GraphQL turned the input down, why. The form stays the same element on the page, so its client entries, such as the post editor, keep what was typed.
- Admin pages use `admin.css` (see [Styles](#styles)) and their own strings, `app/lib/admin/strings.en.json`, loaded the first time an admin page asks for them.
- Their client entries, such as the featured media picker and the list's inline toggle, live in `app/ui/admin/public/`. Links out of the admin, such as a list's "View" links to the public site, set `data-rmx-document={documentLoad(href)}` (`app/ui/admin/links.ts`), so they load in full instead of through client navigation.

### Styles

Components style themselves with `css()` from `remix/component`, in their `mix` prop. During server rendering Remix collects the rules into `<style>` tags in the page's `<head>`, in the `rmx` cascade layer, so a page is styled before any JavaScript loads. Shared pieces are in `app/ui/public/styles.ts`: breakpoints, font sizes, `merge()` for combining style objects, and the site's card, button, label and link styles. The admin's are in `app/ui/admin/public/styles.ts`.

Every public page opens with `PageHeader` (`app/ui/page-header.tsx`), which holds the page's one `<h1>`: in the logo's type on the pages a section opens with (`display`), and in the body's on a page about one thing, such as an artist or a post. A section within a page starts with `SectionHeader`, and the shows' pages share `ShowsNav` (`app/ui/shows/nav.tsx`).

The plain stylesheets in `app/styles/public/`, served by the asset server, put their rules in the `base` layer, which `rmx` wins over:

- `base.css`, on every page: the design tokens (colors, fonts and shadows, as custom properties), a reset, and form controls' defaults
- `site.css`: the public site's page and link styles. Dark mode, the `dark` class on `<html>`, switches the site's color scheme, so colors there and in components pick a side with `light-dark()`.
- `admin.css`: the classes the post editor's Lexical theme gives the DOM it draws, which `css()` can't reach

RUM tracks views manually: Remix navigates with the browser's Navigation API, which the RUM SDK doesn't watch, so `app/actions/public/rum.ts` starts a view on load and after each navigation.

The browser loads the OpenObserve SDKs as their prebuilt bundles, served from `/vendor/openobserve-rum@<version>/` and `/vendor/openobserve-logs@<version>/` by `app/lib/openobserve-bundles.ts`. Served through the asset server, they would be about 275 separate modules, each with an import map entry on every page.

## Production

```bash
pnpm build   # builds shared; there is no app build step
pnpm start   # NODE_ENV=production; compiles, minifies and fingerprints modules on request
```

Assets are served from `/assets` by this server with immutable caching. On Railway, the CDN on the site's domain keeps them at the edge.

Every page is sent with a Content Security Policy (`pagePolicy()` in `app/middleware/headers.ts`) that lets scripts run only from this site, or inline with the response's nonce. Remix gives the nonce to the import map and to the styles `css()` renders, and `Document` gives it to its own inline scripts from `context.nonce`. A new inline script needs the nonce too, and a script from another host needs adding to the policy.

On Railway (detected by `RAILWAY_ENVIRONMENT_NAME`), the server trusts the `X-Forwarded-*` headers from Railway's edge, which replaces any the client sends, so requests get their public `https://` URL, which keeps redirects on https and lets form posts pass `sameOrigin()`.

A merge that changes web and GraphQL deploys both at once, and web can be ready first. So before Railway starts a new web deployment, its pre-deploy command (`pnpm await-api`, in [`railway.toml`](railway.toml)) asks GraphQL for the fields this build needs that the GraphQL release before it doesn't have, every one skipped, so nothing runs. It waits up to four minutes for GraphQL to know them. If GraphQL still doesn't, the deploy fails and the web that's live stays: deploy web again once GraphQL is live. When a change has web ask GraphQL for something new, name it in `newFields` in [`app/lib/api-ready.ts`](app/lib/api-ready.ts).

## Scripts

| Script           | Description                                   |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Start in development                          |
| `pnpm hmr`       | Start in development with hot module reload   |
| `pnpm build`     | Build shared                                  |
| `pnpm start`     | Start the production server                   |
| `pnpm await-api` | Wait for the GraphQL this build needs         |
| `pnpm test`      | Run tests with Remix's test runner            |
| `pnpm typecheck` | Type-check                                    |

The admin's controller tests share a stand-in for GraphQL and requests from a signed-in admin, from `app/actions/admin/test-support.ts`.

## Project Structure

```
app/
├── routes.ts          # Every route's URL pattern
├── router.ts          # Middleware and controllers
├── actions/           # Controllers and pages, by route
│   └── public/        # Browser entry, RUM and other client modules
├── ui/                # Components (ui/public/ holds client entries)
├── lib/               # GraphQL client, i18n and its strings, RUM config, admin session and forms
├── middleware/        # Proxies, GraphQL client, translations, admin session checks
├── styles/public/     # Global stylesheets: tokens, reset, and the site's and admin's base styles
└── types/             # Generated GraphQL schema and operation types
server.ts              # Node HTTP server and logging
public/                # Static files
```

Use the Remix skill in [`.agents/skills/remix/SKILL.md`](.agents/skills/remix/SKILL.md) when building features; it explains how to find the framework's guides and API docs in `node_modules/remix`.
