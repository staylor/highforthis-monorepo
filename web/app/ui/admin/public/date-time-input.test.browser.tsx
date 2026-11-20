// The date and time field of the show and post forms. It runs in a browser (`pnpm test:browser`),
// since it's the browser's datetime-local input and Remix's handling of it that matter.
import * as assert from 'remix/assert';
import { render } from 'remix/component/test';
import { describe, it, type TestContext } from 'remix/test';

import { DateTimeInput } from './date-time-input.tsx';

// 8:00 PM on May 10, 2024 in this browser's time zone
const showTime = new Date(2024, 4, 10, 20, 0).getTime();

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
  it("shows the time in the browser's time zone, and submits its timestamp", (t) => {
    const field = renderInput(t, showTime);
    assert.equal(field.date.value, '2024-05-10T20:00');
    assert.equal(field.submitted(), String(showTime));
  });

  it('keeps a date that was picked or typed, and submits it', async (t) => {
    const field = renderInput(t, showTime);
    await edit(field, '2024-06-20T21:30');
    assert.equal(field.date.value, '2024-06-20T21:30');
    assert.equal(field.submitted(), String(new Date(2024, 5, 20, 21, 30).getTime()));

    await edit(field, '2024-06-21T21:30');
    assert.equal(field.submitted(), String(new Date(2024, 5, 21, 21, 30).getTime()));
  });

  it('submits the last whole date while one is half typed', async (t) => {
    const field = renderInput(t, showTime);
    await edit(field, '2024-06-20T21:30');
    // A datetime-local input's value is empty until every part is filled in
    await edit(field, '');
    assert.equal(field.submitted(), String(new Date(2024, 5, 20, 21, 30).getTime()));
  });

  it('starts empty without a date, and submits nothing until one is set', async (t) => {
    const field = renderInput(t, null);
    assert.equal(field.date.value, '');
    assert.equal(field.submitted(), '');
    await edit(field, '2024-06-20T21:30');
    assert.equal(field.submitted(), String(new Date(2024, 5, 20, 21, 30).getTime()));
  });
});
