import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createRateLimiter } from './rate-limit.ts';

function clock() {
  const time = { now: 1_000 };
  return { time, now: () => time.now };
}

describe('createRateLimiter', () => {
  it('allows the limit in a window, then refuses until the window ends', () => {
    const { time, now } = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now });

    assert.equal(limiter.attempt('a'), true);
    assert.equal(limiter.isLimited('a'), false);
    assert.equal(limiter.attempt('a'), true);
    assert.equal(limiter.isLimited('a'), true);
    assert.equal(limiter.attempt('a'), false);
    assert.equal(limiter.retryAfter('a'), 60);
    assert.equal(limiter.attempt('b'), true, 'each key counts on its own');

    time.now += 60_000;
    assert.equal(limiter.isLimited('a'), false);
    assert.equal(limiter.retryAfter('a'), 0);
    assert.equal(limiter.attempt('a'), true);
  });

  it('forgets a key that is reset', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    limiter.attempt('a');
    assert.equal(limiter.isLimited('a'), true);
    limiter.reset('a');
    assert.equal(limiter.isLimited('a'), false);
  });

  it('keeps at most maxKeys, dropping the oldest', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
    limiter.attempt('first');
    limiter.attempt('second');
    limiter.attempt('third');
    assert.equal(limiter.isLimited('first'), false, 'the oldest key was dropped');
    assert.equal(limiter.isLimited('second'), true);
    assert.equal(limiter.isLimited('third'), true);
  });
});
