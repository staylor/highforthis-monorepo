import { clientEntry, navigate, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { inputBase } from './styles.ts';

// A select whose choices are pages, for a choice that's a path segment a GET form can't submit,
// such as the venue on /admin/show/listings/:venueId. Choosing one goes to its page.

interface NavigateSelectProps {
  value: string;
  placeholder: string;
  choices: { label: string; href: string }[];
}

export const NavigateSelect = clientEntry(
  import.meta.url,
  function NavigateSelect(handle: Handle<NavigateSelectProps>) {
    return () => {
      const { value, placeholder, choices } = handle.props;
      return (
        <select
          aria-label={placeholder}
          class={cn(inputBase, 'h-9 rounded-lg border-neutral-300 bg-white py-0 pr-9 text-sm')}
          mix={on('change', (event) => {
            const href = event.currentTarget.value;
            if (href) {
              navigate(href);
            }
          })}
        >
          <option value="">{placeholder}</option>
          {choices.map((choice) => (
            <option value={choice.href} selected={choice.href === value}>
              {choice.label}
            </option>
          ))}
        </select>
      );
    };
  }
);
