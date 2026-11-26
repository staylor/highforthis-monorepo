import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { acceptTestSession, get, post, stubGraphQL } from '#/actions/admin/test-support.ts';

const users = {
  count: 2,
  edges: [{ node: { id: 'u1', name: 'Ada' } }, { node: { id: 'u2', name: 'Grace' } }],
  pageInfo: { hasNextPage: false },
};

describe('admin users', () => {
  acceptTestSession();

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
    // Each row's Delete asks before it posts
    assert.match(
      html,
      /"exportName":"ConfirmButton"[^}]*"label":"Delete","confirm":"Delete this\? It can't be undone\."/
    );
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
          bio: null,
          roles: ['admin', 'editor'],
        },
      },
    });
  });

  it('keeps a name, a password or a bio that is all digits as text', async (t) => {
    const operations = stubGraphQL(t, { UpdateUser: { updateUser: { id: 'u1' } } });
    await post('/admin/user/u1', 'name=808&email=ada%40example.com&password=0123456789&bio=42');
    assert.deepEqual(operations.at(-1)?.variables.input, {
      name: '808',
      email: 'ada@example.com',
      password: '0123456789',
      bio: '42',
    });
  });

  it("edits a user, leaving the password alone when it's left empty", async (t) => {
    const user = {
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

    const response = await post(
      '/admin/user/u1',
      'name=Ada+L&email=ada%40example.com&password=&bio='
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/user/u1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdateUser',
      // GraphQL keeps the password it has when it's sent null, and clears the bio
      variables: {
        id: 'u1',
        input: { name: 'Ada L', email: 'ada@example.com', password: null, bio: null },
      },
    });
  });

  it("answers 404 for a user that doesn't exist", async (t) => {
    stubGraphQL(t, { UserEdit: { user: null } });
    const response = await get('/admin/user/nobody');
    assert.equal(response.status, 404);
  });
});
