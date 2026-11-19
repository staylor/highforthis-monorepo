import { clientEntry, on, ref, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

// The post form's title, from the admin app's "heading" field: one line of large text that wraps
// and grows instead of scrolling sideways, so a long title is all visible. Enter doesn't start a
// new line. Without JavaScript it's a textarea a line tall.

interface HeadingFieldProps {
  name: string;
  value: string;
  placeholder: string;
  class?: string;
}

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
          class={cn('w-full resize-none overflow-hidden bg-transparent', handle.props.class)}
          mix={[
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
