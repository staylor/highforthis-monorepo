// The dark mode switch. It runs in a browser (`pnpm test:browser`), since reaching it with the
// keyboard is the browser's doing.
import * as assert from 'remix/assert';
import { render } from 'remix/component/test';
import { describe, it, type TestContext } from 'remix/test';

import { DarkMode } from './dark-mode.tsx';

function renderSwitch(t: TestContext) {
  localStorage.removeItem('darkMode');
  document.documentElement.classList.remove('dark');
  const result = render(<DarkMode id="dark-mode" label="Enable Dark Mode!" />);
  t.after(() => {
    result.cleanup();
    localStorage.removeItem('darkMode');
    document.documentElement.classList.remove('dark');
  });
  return { ...result, input: result.$('input[type="checkbox"]') as HTMLInputElement };
}

describe('DarkMode', () => {
  it('can be reached with the keyboard, and is named for a screen reader', async (t) => {
    const { input } = renderSwitch(t);
    // A box that isn't displayed can't take focus
    input.focus();
    assert.equal(document.activeElement, input);
    assert.notEqual(getComputedStyle(input).display, 'none');
    assert.equal(input.getAttribute('aria-label'), 'Enable Dark Mode!');
  });

  it('switches the page to dark and back, and remembers the choice', async (t) => {
    const { input, act } = renderSwitch(t);
    await act(() => input.click());
    assert.ok(document.documentElement.classList.contains('dark'));
    assert.equal(localStorage.getItem('darkMode'), '1');
    assert.equal(input.checked, true);

    await act(() => input.click());
    assert.ok(!document.documentElement.classList.contains('dark'));
    assert.equal(localStorage.getItem('darkMode'), null);
  });

  it('starts switched on when dark mode was chosen before', async (t) => {
    localStorage.setItem('darkMode', '1');
    const result = render(<DarkMode id="dark-mode" label="Enable Dark Mode!" />);
    t.after(() => {
      result.cleanup();
      localStorage.removeItem('darkMode');
    });
    await result.act(() => {});
    assert.equal((result.$('input[type="checkbox"]') as HTMLInputElement).checked, true);
  });
});
