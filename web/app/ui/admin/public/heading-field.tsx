import { clientEntry, css, on, ref, type Handle } from 'remix/component';

import { lg } from '#/ui/public/styles.ts';

// One line of large text that wraps and grows instead of scrolling sideways, so a long title is
// all visible. Enter doesn't start a new line. Without JavaScript it's a textarea a line tall.

interface HeadingFieldProps {
  name: string;
  value: string;
  placeholder: string;
}

// Big and bold, without the box of other fields
const field = css({
  margin: '0 0 0.625rem',
  display: 'block',
  width: '100%',
  resize: 'none',
  overflow: 'hidden',
  border: 0,
  backgroundColor: 'transparent',
  padding: 0,
  fontSize: '2.25rem',
  lineHeight: 1.25,
  fontWeight: 900,
  letterSpacing: '0.025em',
  overflowWrap: 'break-word',
  boxShadow: 'none',
  '&:focus': { boxShadow: 'none' },
  [lg]: { marginBottom: '1.5rem', fontSize: '3rem' },
});

const grow = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const HeadingField = clientEntry(
  import.meta.url,
  function HeadingField(handle: Handle<HeadingFieldProps>) {
    return () => {
      const { name, value, placeholder } = handle.props;
      return (
        <textarea
          name={name}
          rows={1}
          defaultValue={value}
          placeholder={placeholder}
          aria-label={placeholder}
          mix={[
            field,
            ref((node) => grow(node as HTMLTextAreaElement)),
            on('input', (event) => grow(event.currentTarget)),
            on('keydown', (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }),
          ]}
        />
      );
    };
  }
);
