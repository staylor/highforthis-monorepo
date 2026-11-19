import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it } from 'remix/test';

import { testSecret, testSession, testToken } from './adminSession.fixtures.ts';
import { adminSessionCookie, adminToken, expiredAdminCookie } from './adminSession.ts';

// A session without a token, which React Router signed with `testSecret` as it did testSession.
// remix/cookie neither percent-encodes the value it writes nor decodes the one it reads, so both
// are as React Router signed them, before it percent-encoded them.
const withoutToken = '__session=eyJmbGFzaCI6IngifQ==.gEHjeaPyLqG1OUb0/xQSQEwpQEQjI3ZtnRGccLK75GE';

describe('adminToken', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('reads the token from a session cookie signed as React Router signed them', async () => {
    assert.equal(await adminToken(`theme=dark; ${testSession}`), testToken);
  });

  it('is null without a token, a cookie or a valid signature', async () => {
    assert.equal(await adminToken(withoutToken), null);
    assert.equal(await adminToken(null), null);
    assert.equal(await adminToken('theme=dark'), null);
    assert.equal(await adminToken(testSession.replace('0jvC', '1jvC')), null);
  });

  it('rejects a cookie signed with another secret', async () => {
    process.env.TOKEN_SECRET = 'other-secret';
    assert.equal(await adminToken(testSession), null);
  });
});

describe('adminSessionCookie', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('writes the token, signed as React Router signed it, for 12 hours', async () => {
    assert.equal(
      await adminSessionCookie(testToken),
      `${testSession}; HttpOnly; Max-Age=43200; Path=/; SameSite=Lax`
    );
  });

  it('is read back as the token', async () => {
    const cookie = (await adminSessionCookie('another-token')).split(';')[0];
    assert.equal(await adminToken(cookie), 'another-token');
  });

  it('is secure in production, as is signing out', async (t) => {
    // process.env takes only plain values, so the whole object is swapped for a copy
    t.mock.property(process, 'env', { ...process.env, NODE_ENV: 'production' });
    assert.match(await adminSessionCookie(testToken), /; Secure$/);
    assert.equal(
      await expiredAdminCookie(),
      '__session=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure'
    );
  });
});
