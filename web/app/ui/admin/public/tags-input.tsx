import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { Icon } from './icon.tsx';
import { inputBase } from './styles.ts';

// Enter adds what's typed as a tag, each tag has a button to remove it, and the form submits
// them as hidden inputs sharing a name.

interface TagsInputProps {
  name: string;
  tags: string[];
  placeholder: string;
  /** Translated "Remove {{tag}}", each remove button's label. */
  removeLabel: string;
}

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
            class={cn(inputBase, 'w-full')}
            mix={on('keydown', (event) => {
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
            })}
          />
          <div class="my-1.5 overflow-auto text-xs">
            {current().map((tag) => (
              <div
                key={tag}
                class="float-left mr-1.5 max-w-full cursor-default overflow-hidden text-sm text-ellipsis"
              >
                <input type="hidden" name={name} value={tag} />
                <button
                  type="button"
                  aria-label={removeLabel.replace('{{tag}}', tag)}
                  class="float-left mr-0.5 flex size-5 cursor-pointer items-center justify-center rounded-full text-dark transition-colors hover:bg-neutral-200"
                  mix={on('click', () => {
                    tags = current().filter((other) => other !== tag);
                    handle.update();
                  })}
                >
                  <Icon name="close" class="size-3.5" />
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
