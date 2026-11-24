import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { initials } from './utils.ts';

describe('initials', () => {
  it('stands in for artwork with the words that matter', () => {
    assert.equal(initials('Madison Square Garden'), 'MSG');
    assert.equal(initials('The Capitol Theatre'), 'CT');
    assert.equal(initials('Terminal 5'), 'T5');
    assert.equal(initials('Radio City Music Hall'), 'RCM');
    assert.equal(initials('The The'), 'TT');
    assert.equal(initials('Sphere'), 'S');
    assert.equal(initials(''), '');
  });
});
