// The date and time field of the show and post forms. It runs in a browser (`pnpm test:browser`),
// since it's the browser's datetime-local input and Remix's handling of it that matter.
import * as assert from 'remix/assert';
import { render } from 'remix/component/test';
import { describe, it, type TestContext } from 'remix/test';

import { DateTimeInput } from './date-time-input.tsx';

// 8:00 PM on May 10, 2024 in New York, which is midnight in UTC, whatever this browser's time zone
const showTime = Date.UTC(2024, 4, 11, 0, 0);
// 9:30 PM on June 20th and 21st in New York
const june20 = Date.UTC(2024, 5, 21, 1, 30);
const june21 = Date.UTC(2024, 5, 22, 1, 30);

function renderInput(t: TestContext, value: number | null) {
  const result = render(<DateTimeInput name="date" value={value} id="date" />);
  t.after(result.cleanup);
  return {
    ...result,
    date: result.$('#date') as HTMLInputElement,
    submitted: () => (result.$('input[type="hidden"]') as HTMLInputElement).value,
  };
}

// A change to the date as the browser makes it, when a date is picked or a part of one typed
async function edit({ act, date }: ReturnType<typeof renderInput>, value: string) {
  await act(() => {
    date.value = value;
    date.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // Remix would put a controlled input's value back on a microtask after `input`
  await new Promise((resolve) => setTimeout(resolve));
}

describe('DateTimeInput', () => {
  it("shows the time on New York's clocks, and submits its timestamp", (t) => {
    const field = renderInput(t, showTime);
    assert.equal(field.date.value, '2024-05-10T20:00');
    assert.equal(field.submitted(), String(showTime));
  });

  it('keeps a date that was picked or typed, and submits it', async (t) => {
    const field = renderInput(t, showTime);
    await edit(field, '2024-06-20T21:30');
    assert.equal(field.date.value, '2024-06-20T21:30');
    assert.equal(field.submitted(), String(june20));

    await edit(field, '2024-06-21T21:30');
    assert.equal(field.submitted(), String(june21));
  });

  it('submits the last whole date while one is half typed', async (t) => {
    const field = renderInput(t, showTime);
    await edit(field, '2024-06-20T21:30');
    // A datetime-local input's value is empty until every part is filled in
    await edit(field, '');
    assert.equal(field.submitted(), String(june20));
  });

  it('starts empty without a date, and submits nothing until one is set', async (t) => {
    const field = renderInput(t, null);
    assert.equal(field.date.value, '');
    assert.equal(field.submitted(), '');
    await edit(field, '2024-06-20T21:30');
    assert.equal(field.submitted(), String(june20));
  });
});
