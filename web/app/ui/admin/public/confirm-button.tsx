import { clientEntry, css, on, type Handle } from 'remix/component';

// A submit button that asks first, such as before removing a passkey or deleting a list's row.
// Without JavaScript it submits straight away.

interface ConfirmButtonProps {
  label: string;
  /** The question the browser asks before the form submits. */
  confirm: string;
  /** Looks like a link among a row's actions, instead of a button. */
  inline?: boolean;
}

// Red, for removing things
const button = css({
  cursor: 'pointer',
  borderRadius: '0.25rem',
  border: '1px solid var(--red-700)',
  backgroundColor: '#fff',
  padding: '0.5rem 0.75rem',
  color: 'var(--red-700)',
});

const inlineButton = css({
  cursor: 'pointer',
  color: 'var(--pink)',
  '&:hover': { textDecoration: 'underline' },
});

export const ConfirmButton = clientEntry(
  import.meta.url,
  function ConfirmButton(handle: Handle<ConfirmButtonProps>) {
    return () => (
      <button
        type="submit"
        mix={[
          handle.props.inline ? inlineButton : button,
          on('click', (event) => {
            if (!window.confirm(handle.props.confirm)) {
              event.preventDefault();
            }
          }),
        ]}
      >
        {handle.props.label}
      </button>
    );
  }
);
