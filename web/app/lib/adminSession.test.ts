import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it } from 'remix/test';

import { adminToken } from './adminSession.ts';

// Made by the admin app's React Router createCookieSessionStorage with the secret
// 'test-secret': one session holds a token, the other doesn't.
const withToken =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ%3D%3D.0jvC0SjKdfmXr5Rw%2F6679ia0w0xRgH4hIpEzB3aJ9Fc';
const withoutToken =
  '__session=eyJmbGFzaCI6IngifQ%3D%3D.gEHjeaPyLqG1OUb0%2FxQSQEwpQEQjI3ZtnRGccLK75GE';

describe('adminToken', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it("reads the token from the admin app's session cookie", () => {
    assert.equal(adminToken(`theme=dark; ${withToken}`), 'test-token');
  });

  it('is null without a token, a cookie or a valid signature', () => {
    assert.equal(adminToken(withoutToken), null);
    assert.equal(adminToken(null), null);
    assert.equal(adminToken('theme=dark'), null);
    assert.equal(adminToken(withToken.replace('0jvC', '1jvC')), null);
  });

  it('rejects a cookie signed with another secret', () => {
    process.env.TOKEN_SECRET = 'other-secret';
    assert.equal(adminToken(withToken), null);
  });
});
