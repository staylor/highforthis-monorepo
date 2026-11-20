import { clientEntry, css, on, type Handle } from 'remix/component';

import { merge, sm } from '#/ui/public/styles.ts';

import { input } from './styles.ts';

const dateInput = css(merge(input, { width: '100%', [sm]: { width: 'auto' } }));

// A datetime-local input in the browser's time zone, and a hidden input with the timestamp,
// which is what the form submits. The page renders the time in the server's time zone until
// the browser runs this.
//
// The date input is uncontrolled. Remix puts a controlled input's value back after every `input`
// event that doesn't render a new one, which undid each pick and keystroke before `change`, and a
// half-typed date has no value to render.

interface DateTimeInputProps {
  name: string;
  /** Milliseconds since the epoch, or null for none yet, such as a new post's publish date. */
  value: number | null;
  id?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A timestamp as a datetime-local value, 2024-05-10T20:00, in this runtime's time zone. */
function localValue(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const DateTimeInput = clientEntry(
  import.meta.url,
  function DateTimeInput(handle: Handle<DateTimeInputProps>) {
    // The last whole date and time picked or typed
    let timestamp: number | null = null;

    return () => {
      const { name, id, value } = handle.props;
      const current = timestamp ?? value;
      return (
        <>
          <input type="hidden" name={name} value={current === null ? '' : String(current)} />
          <input
            type="datetime-local"
            id={id}
            defaultValue={value === null ? '' : localValue(value)}
            mix={[
              dateInput,
              on('input', (event) => {
                const parsed = Date.parse(event.currentTarget.value);
                if (!Number.isNaN(parsed)) {
                  timestamp = parsed;
                  handle.update();
                }
              }),
            ]}
          />
        </>
      );
    };
  }
);
