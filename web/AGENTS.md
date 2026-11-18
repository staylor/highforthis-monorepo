# Web agent guide

The public site, built with Remix 3. Read [README.md](README.md) for how it fits with the admin app and GraphQL.

## Building features

Use the Remix skill in [`.agents/skills/remix/SKILL.md`](.agents/skills/remix/SKILL.md) for the Remix mental model, and `node_modules/remix/INDEX.md` for its guides and API READMEs. Remix 3 isn't React: components are `(handle) => () => JSX`, with plain variables for state and `handle.update()` to re-render.

## Layout

- `app/routes.ts` defines every route's URL pattern, shared by server and browser modules for type-safe hrefs.
- `app/router.ts` installs the middleware and maps routes to controllers.
- `app/actions/controller.tsx` handles top-level routes; `app/actions/<route-key>/controller.tsx` handles nested route maps.
- Browser code lives under `app/**/public/`. Only those files and the packages in `app/assets.ts`'s `allowPackages` are served to browsers. Packages browser code imports, including their dependencies, must be listed there and be direct dependencies.
- GraphQL operation types are generated into `app/types/graphql.ts` by the root `pnpm codegen`.

## Checks

```sh
pnpm test
pnpm typecheck
```

From the monorepo root, also run `pnpm lint` and `pnpm knip`.
