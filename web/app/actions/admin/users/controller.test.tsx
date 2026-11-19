import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { router } from '../../../router.ts';

const origin = 'http://localhost';

// A session cookie signed with the secret 'test-secret', holding the token 'test-token'
const session =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ%3D%3D.0jvC0SjKdfmXr5Rw%2F6679ia0w0xRgH4hIpEzB3aJ9Fc';

type Operation = { operationName: string; variables: Record<string, any> };

/**
 * Stands in for GraphQL: accepts the session, answers each operation by name, and records the
 * operations it was sent.
 */
function stubGraphQL(t: TestContext, answers: Record<string, unknown> = {}) {
  const operations: Operation[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/auth/session') {
      return new Response(null, { status: 200 });
    }
    const { operationName, variables } = JSON.parse(String(init?.body));
    operations.push({ operationName, variables });
    return Response.json({ data: answers[operationName] ?? {} });
  });
  return operations;
}

const users = {
  count: 2,
  edges: [{ node: { id: 'u1', name: 'Ada' } }, { node: { id: 'u2', name: 'Grace' } }],
  pageInfo: { hasNextPage: false },
};

const get = (path: string, cookie = session) =>
  router.fetch(new Request(new URL(path, origin), { headers: cookie ? { cookie } : {} }));

const post = (path: string, body: string, from = origin) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: session, origin: from },
    })
  );

describe('admin users', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('sends someone who is signed out to the login page', async (t) => {
    stubGraphQL(t);
    const response = await get('/admin/user', '');
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/login/unauthorized');
  });

  it('lists users with links to edit them, delete buttons and the search box', async (t) => {
    const operations = stubGraphQL(t, { UsersAdmin: { users } });
    const html = await (await get('/admin/user?search=a&deleted=1')).text();
    assert.match(html, /<a href="\/admin\/user\/u1">Ada<\/a>/);
    assert.match(html, /<a href="\/admin\/user\/u2">Grace<\/a>/);
    assert.match(html, /<input type="hidden" name="ids" value="u2"/);
    assert.match(html, /<input type="checkbox" name="ids" value="u1" form="bulk-actions"/);
    assert.match(html, /<input type="search" name="search" value="a"/);
    assert.match(html, /Deleted 1 user/);
    assert.deepEqual(operations.find((op) => op.operationName === 'UsersAdmin')?.variables, {
      first: 20,
      search: 'a',
    });
  });

  it('deletes the checked users and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeleteUser: { removeUser: true } });
    const response = await post('/admin/user?page=2', 'intent=delete&ids=u1&ids=u2');
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'http://localhost/admin/user?page=2&deleted=2');
    assert.deepEqual(operations, [
      { operationName: 'DeleteUser', variables: { ids: ['u1', 'u2'] } },
    ]);
  });

  it('does nothing when Apply is pressed with no action chosen', async (t) => {
    const operations = stubGraphQL(t);
    const response = await post('/admin/user', 'intent=&ids=u1');
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/admin/user');
    assert.deepEqual(operations, []);
  });

  it('refuses a delete posted from another site', async (t) => {
    const operations = stubGraphQL(t);
    const response = await post('/admin/user', 'intent=delete&ids=u1', 'https://evil.example');
    assert.equal(response.status, 400);
    assert.deepEqual(operations, []);
  });

  it('adds a user and goes to their edit page', async (t) => {
    const operations = stubGraphQL(t, { CreateUser: { createUser: { id: 'u9' } } });
    const form = await (await get('/admin/user/add')).text();
    assert.match(form, /<input type="email" name="email"/);
    assert.match(form, /<select name="roles" multiple/);

    const response = await post(
      '/admin/user/add',
      'name=Lin&email=lin%40example.com&password=pw&bio=&roles=admin&roles=editor'
    );
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/user/u9?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'CreateUser',
      variables: {
        input: {
          name: 'Lin',
          email: 'lin@example.com',
          password: 'pw',
          roles: ['admin', 'editor'],
        },
      },
    });
  });

  it("edits a user, leaving the password alone when it's left empty", async (t) => {
    // GraphQL answers with __typename, which Apollo needs to fill the form's fragment
    const user = {
      __typename: 'User',
      id: 'u1',
      name: 'Ada',
      email: 'ada@example.com',
      bio: 'Hi',
      roles: ['admin'],
    };
    const operations = stubGraphQL(t, {
      UserEdit: { user },
      UpdateUser: { updateUser: user },
    });
    const form = await (await get('/admin/user/u1?message=updated')).text();
    assert.match(form, /<input type="text" name="name" value="Ada"/);
    assert.match(form, /<option value="admin" selected/);
    assert.doesNotMatch(form, /<option value="editor" selected/);
    assert.match(form, /<textarea name="bio"[^>]*>Hi<\/textarea>/);
    assert.match(form, /<input type="password" name="password" autocomplete="off"/);
    assert.match(form, /User updated\./);

    const response = await post('/admin/user/u1', 'name=Ada+L&email=ada%40example.com&password=');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/user/u1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdateUser',
      variables: { id: 'u1', input: { name: 'Ada L', email: 'ada@example.com' } },
    });
  });

  it("answers 404 for a user that doesn't exist", async (t) => {
    stubGraphQL(t, { UserEdit: { user: null } });
    const response = await get('/admin/user/nobody');
    assert.equal(response.status, 404);
  });
});
