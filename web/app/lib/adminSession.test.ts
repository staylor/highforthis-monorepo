import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it } from 'remix/test';

import { adminSessionCookie, adminToken, expiredAdminCookie } from './adminSession.ts';

// Signed by React Router's createCookieSessionStorage with the secret 'test-secret': one session
// holds a token, the other doesn't. remix/cookie signs the same way, but neither percent-encodes
// the value it writes nor decodes the one it reads, so these are as React Router signed them,
// before it percent-encoded them.
const withToken =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ==.0jvC0SjKdfmXr5Rw/6679ia0w0xRgH4hIpEzB3aJ9Fc';
const withoutToken = '__session=eyJmbGFzaCI6IngifQ==.gEHjeaPyLqG1OUb0/xQSQEwpQEQjI3ZtnRGccLK75GE';

describe('adminToken', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('reads the token from a session cookie signed as React Router signed them', async () => {
    assert.equal(await adminToken(`theme=dark; ${withToken}`), 'test-token');
  });

  it('is null without a token, a cookie or a valid signature', async () => {
    assert.equal(await adminToken(withoutToken), null);
    assert.equal(await adminToken(null), null);
    assert.equal(await adminToken('theme=dark'), null);
    assert.equal(await adminToken(withToken.replace('0jvC', '1jvC')), null);
  });

  it('rejects a cookie signed with another secret', async () => {
    process.env.TOKEN_SECRET = 'other-secret';
    assert.equal(await adminToken(withToken), null);
  });
});

describe('adminSessionCookie', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('writes the token, signed as React Router signed it, for 12 hours', async () => {
    assert.equal(
      await adminSessionCookie('test-token'),
      `${withToken}; HttpOnly; Max-Age=43200; Path=/; SameSite=Lax`
    );
  });

  it('is read back as the token', async () => {
    const cookie = (await adminSessionCookie('another-token')).split(';')[0];
    assert.equal(await adminToken(cookie), 'another-token');
  });

  it('is secure in production, as is signing out', async (t) => {
    // process.env takes only plain values, so the whole object is swapped for a copy
    t.mock.property(process, 'env', { ...process.env, NODE_ENV: 'production' });
    assert.match(await adminSessionCookie('test-token'), /; Secure$/);
    assert.equal(
      await expiredAdminCookie(),
      '__session=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure'
    );
  });
});
