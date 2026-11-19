import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { inputBase } from './styles.ts';

// Submits its GET form as soon as it changes. Without JavaScript, the form's Apply button
// submits it instead.

interface Choice {
  label: string;
  value: string;
}

interface AutoSubmitSelectProps {
  name: string;
  value: string;
  /** The empty choice, which removes the filter. */
  placeholder: string;
  choices: Choice[];
}

export const AutoSubmitSelect = clientEntry(
  import.meta.url,
  function AutoSubmitSelect(handle: Handle<AutoSubmitSelectProps>) {
    return () => {
      const { name, value, placeholder, choices } = handle.props;
      return (
        <select
          name={name}
          aria-label={placeholder}
          class={cn(inputBase, 'h-9 rounded-lg border-neutral-300 bg-white py-0 pr-9 text-sm')}
          mix={on('change', (event) => event.currentTarget.form?.requestSubmit())}
        >
          <option value="">{placeholder}</option>
          {choices.map((choice) => (
            <option value={choice.value} selected={choice.value === value}>
              {choice.label}
            </option>
          ))}
        </select>
      );
    };
  }
);
