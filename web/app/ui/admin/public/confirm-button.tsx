import { clientEntry, on, type Handle } from 'remix/component';

// A submit button that asks first, such as before removing a passkey. Without JavaScript it
// submits straight away.

interface ConfirmButtonProps {
  label: string;
  /** The question the browser asks before the form submits. */
  confirm: string;
  class?: string;
}

export const ConfirmButton = clientEntry(
  import.meta.url,
  function ConfirmButton(handle: Handle<ConfirmButtonProps>) {
    return () => (
      <button
        type="submit"
        class={handle.props.class}
        mix={on('click', (event) => {
          if (!window.confirm(handle.props.confirm)) {
            event.preventDefault();
          }
        })}
      >
        {handle.props.label}
      </button>
    );
  }
);
