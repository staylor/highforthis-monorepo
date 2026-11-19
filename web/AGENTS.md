# Web agent guide

The public site and admin, built with Remix 3. Read [README.md](README.md) for how it fits with GraphQL.

## Building features

Use the Remix skill in [`.agents/skills/remix/SKILL.md`](.agents/skills/remix/SKILL.md) for the Remix mental model, and `node_modules/remix/INDEX.md` for its guides and API READMEs. Remix 3 isn't React: components are `(handle) => () => JSX`, with plain variables for state and `handle.update()` to re-render.

## Layout

- `app/routes.ts` defines every route's URL pattern, shared by server and browser modules for type-safe hrefs.
- `app/router.ts` installs the middleware and maps routes to controllers.
- `app/actions/controller.tsx` handles top-level routes; `app/actions/<route-key>/controller.tsx` handles nested route maps.
- Browser code lives under `app/**/public/`. Only those files and the packages in `app/assets.ts`'s `allowPackages` are served to browsers. Packages browser code imports, including their dependencies, must be listed there and be direct dependencies. Every module served adds an import map entry to every page, so load large libraries from a prebuilt bundle instead, the way `app/lib/openobserve-bundles.ts` serves the OpenObserve SDKs.
- GraphQL operation types are generated into `app/types/graphql.ts` by the root `pnpm codegen`.
- Admin pages live in `app/actions/admin/` and `app/ui/admin/`. Their controllers list `sameOrigin()` and `requireAdmin()` and render with `renderAdminPage()`. See the README's "Admin pages".

## Checks

```sh
pnpm test
pnpm typecheck
```

From the monorepo root, also run `pnpm lint` and `pnpm knip`, and `pnpm test:browser` for tests that run in a browser (`*.test.browser.ts`, such as the post editor's). They run from the root so Remix's browser harness can reach pnpm's `node_modules`.
