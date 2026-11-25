import { clientEntry, css, on, type Handle } from 'remix/component';

import { merge, sm, text } from '#/ui/public/styles.ts';

import { fromNewYorkTime, toNewYorkTime } from './new-york-time.ts';
import { input } from './styles.ts';

const dateInput = css(merge(input, { width: '100%', [sm]: { width: 'auto' } }));
const hintStyle = css({ marginLeft: '0.5rem', ...text.sm, color: 'var(--neutral-600)' });

// A datetime-local input showing New York's time, where the shows are, whatever the browser's time
// zone, and a hidden input with the timestamp, which is what the form submits.
//
// The date input is uncontrolled. Remix puts a controlled input's value back after every `input`
// event that doesn't render a new one, which undid each pick and keystroke before `change`, and a
// half-typed date has no value to render.

interface DateTimeInputProps {
  name: string;
  /** Milliseconds since the epoch, or null for none yet, such as a new post's publish date. */
  value: number | null;
  id?: string;
  /** Translated "New York time", which goes beside the input. */
  hint?: string;
}

export const DateTimeInput = clientEntry(
  import.meta.url,
  function DateTimeInput(handle: Handle<DateTimeInputProps>) {
    // The last whole date and time picked or typed
    let timestamp: number | null = null;

    return () => {
      const { name, id, value, hint } = handle.props;
      const current = timestamp ?? value;
      const hintId = hint && id ? `${id}-hint` : undefined;
      return (
        <>
          <input type="hidden" name={name} value={current === null ? '' : String(current)} />
          <input
            type="datetime-local"
            id={id}
            defaultValue={value === null ? '' : toNewYorkTime(value)}
            aria-describedby={hintId}
            mix={[
              dateInput,
              on('input', (event) => {
                const parsed = fromNewYorkTime(event.currentTarget.value);
                if (!Number.isNaN(parsed)) {
                  timestamp = parsed;
                  handle.update();
                }
              }),
            ]}
          />
          {hint && (
            <span id={hintId} mix={hintStyle}>
              {hint}
            </span>
          )}
        </>
      );
    };
  }
);
