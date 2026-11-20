import { clientEntry, css, on, type Handle } from 'remix/component';

import { colorTransition, text } from '#/ui/public/styles.ts';

import { Icon } from './icon.tsx';
import { wideInput } from './styles.ts';

// Enter adds what's typed as a tag, each tag has a button to remove it, and the form submits
// them as hidden inputs sharing a name.

interface TagsInputProps {
  name: string;
  tags: string[];
  placeholder: string;
  /** Translated "Remove {{tag}}", each remove button's label. */
  removeLabel: string;
}

const tagStyle = css({
  float: 'left',
  marginRight: '0.375rem',
  maxWidth: '100%',
  cursor: 'default',
  overflow: 'hidden',
  ...text.sm,
  textOverflow: 'ellipsis',
});

const removeButton = css({
  float: 'left',
  marginRight: '0.125rem',
  display: 'flex',
  width: '1.25rem',
  height: '1.25rem',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  color: 'var(--dark)',
  ...colorTransition,
  '&:hover': { backgroundColor: 'var(--neutral-200)' },
});

export const TagsInput = clientEntry(
  import.meta.url,
  function TagsInput(handle: Handle<TagsInputProps>) {
    let tags: string[] | null = null;
    const current = () => (tags ??= [...handle.props.tags]);

    return () => {
      const { name, placeholder, removeLabel } = handle.props;
      return (
        <>
          <input
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
            mix={[
              wideInput,
              on('keydown', (event) => {
                if (event.key !== 'Enter') {
                  return;
                }
                // Enter adds a tag instead of submitting the form
                event.preventDefault();
                const input = event.currentTarget;
                const tag = input.value.trim();
                if (tag && !current().includes(tag)) {
                  tags = [...current(), tag];
                  handle.update();
                }
                input.value = '';
              }),
            ]}
          />
          <div mix={css({ marginBlock: '0.375rem', overflow: 'auto', ...text.xs })}>
            {current().map((tag) => (
              <div key={tag} mix={tagStyle}>
                <input type="hidden" name={name} value={tag} />
                <button
                  type="button"
                  aria-label={removeLabel.replace('{{tag}}', tag)}
                  mix={[
                    removeButton,
                    on('click', () => {
                      tags = current().filter((other) => other !== tag);
                      handle.update();
                    }),
                  ]}
                >
                  <Icon name="close" size="0.875rem" />
                </button>{' '}
                {tag}
              </div>
            ))}
          </div>
        </>
      );
    };
  }
);
