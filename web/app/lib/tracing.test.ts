import * as assert from 'remix/assert';
import { createRouter } from 'remix/router';
import { describe, it } from 'remix/test';

import { tracedMatcher } from './tracing.ts';

describe('tracedMatcher', () => {
  function tracedRouter() {
    const names: string[] = [];
    const router = createRouter({
      matcher: tracedMatcher((method, route) => names.push(`${method} ${route}`)),
    });
    router.get('/shows/:id', () => new Response('show'));
    router.get('/admin', {
      // Like requireAdmin(), sends people who aren't signed in away before the action runs
      middleware: [() => new Response(null, { status: 302, headers: { location: '/login' } })],
      handler: () => new Response('admin'),
    });
    return { names, router };
  }

  it('names the span after the pattern that matched, not the URL', async () => {
    const { names, router } = tracedRouter();
    const response = await router.fetch('http://localhost/shows/42');
    assert.equal(await response.text(), 'show');
    assert.deepEqual(names, ['GET /shows/:id']);
  });

  it("names it before the route's own middleware, which may answer first", async () => {
    const { names, router } = tracedRouter();
    const response = await router.fetch('http://localhost/admin');
    assert.equal(response.status, 302);
    assert.deepEqual(names, ['GET /admin']);
  });

  it('leaves requests no route matched alone', async () => {
    const { names, router } = tracedRouter();
    assert.equal((await router.fetch('http://localhost/nowhere')).status, 404);
    assert.deepEqual(names, []);
  });
});
