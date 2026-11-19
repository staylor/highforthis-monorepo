// Lexical's package entries read process.env.NODE_ENV to pick a build. The asset server defines it
// for pages; the browser test harness doesn't, so the editor's tests import this first.
(globalThis as { process?: unknown }).process ??= { env: { NODE_ENV: 'development' } };
