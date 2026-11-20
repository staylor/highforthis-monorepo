import { clientEntry, css, on, type Handle } from 'remix/component';

import { merge } from '#/ui/public/styles.ts';

import { checkbox } from './styles.ts';

const toggle = css(merge(checkbox, { '&:focus': { borderColor: 'var(--pink)' } }));

// Saves as soon as it changes, posting the intent, the row's ID and `name` as true or false to
// the list's action. The action answers 204 when it saved, and the box goes back if it didn't.
// Without JavaScript the box can't save.

interface InlineToggleProps {
  /** What the list's action does with it, such as `excludeFromSearch`. */
  intent: string;
  name: string;
  id: string;
  checked: boolean;
  label: string;
}

export const InlineToggle = clientEntry(
  import.meta.url,
  function InlineToggle(handle: Handle<InlineToggleProps>) {
    let checked: boolean | null = null;
    let saving = false;

    async function save(input: HTMLInputElement) {
      const { intent, name, id } = handle.props;
      const value = input.checked;
      // Shows the new value while it saves, and goes back if the save fails
      checked = value;
      saving = true;
      handle.update();
      const body = new URLSearchParams({ intent, id, [name]: String(value) });
      try {
        // The action redirects when it doesn't answer 204, which this doesn't need to follow
        const response = await fetch(window.location.href, {
          method: 'POST',
          body,
          redirect: 'manual',
        });
        if (response.status !== 204) {
          throw new Error(`Saving ${name} got ${response.status || response.type}`);
        }
      } catch (error) {
        checked = !value;
        console.error(error);
      } finally {
        saving = false;
        handle.update();
      }
    }

    return () => {
      const { label } = handle.props;
      return (
        <input
          type="checkbox"
          checked={checked ?? handle.props.checked}
          disabled={saving}
          aria-label={label}
          mix={[toggle, on('change', (event) => void save(event.currentTarget))]}
        />
      );
    };
  }
);
