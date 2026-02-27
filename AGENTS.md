# Agent Guidelines

## Dependencies

- **Always install exact versions of dependencies** (use `--save-exact` or `-E` flag with `pnpm add`). Do not use `^` or `~` ranges.

## Code Quality

- **Run lint, knip, test, and typecheck after making code changes.** Use `pnpm lint`, `pnpm knip`, `pnpm test:web`, `pnpm typecheck:graphql`, and/or `pnpm typecheck:web` as appropriate for the workspaces affected.

## Git

- **Always confirm with the user before committing.** Present a summary of the changes and the proposed commit message, then ask for a simple yes/no before running `git commit`.
- When amending, confirm as well unless the user explicitly says "amend" in the same message as the change request.
- **Automatically push after every commit or amend** (`git push` or `git push --force-with-lease` for amends).
