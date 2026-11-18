import type { SelectHTMLAttributes, ChangeEvent } from 'react';
import { twMerge } from 'tailwind-merge';

import { inputBase } from '#/components/Form/styles';

export type Choice = string | number | { label: string; value: string | number };
type Group = { label: string; choices: Choice[] };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  onChange?: (value: any) => void;
  placeholder?: string;
  choices?: Choice[];
  groups?: Group[];
};

const renderOption = (choice: Choice) => {
  if (typeof choice === 'object') {
    return (
      <option key={choice.value} value={choice.value}>
        {choice.label}
      </option>
    );
  }
  return (
    <option key={choice} value={choice}>
      {choice}
    </option>
  );
};

export default function Select({
  className,
  placeholder,
  multiple: multipleProp = false,
  choices,
  groups,
  children = null,
  value,
  onChange: onChangeProp,
  ...rest
}: SelectProps) {
  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let val: string | string[] = (e.target as HTMLSelectElement).value;
    const multiple = Boolean(multipleProp);
    if (multiple) {
      val = [...e.target.options].filter((o) => o.selected).map((o) => o.value);
    }
    if (onChangeProp) {
      onChangeProp(val);
    }
  };

  return (
    <select
      {...rest}
      onChange={onChange}
      defaultValue={value}
      multiple={multipleProp ? Boolean(multipleProp) : false}
      className={twMerge(
        inputBase,
        'h-9 rounded-lg border-neutral-300 bg-white py-0 pr-9 text-sm shadow-xs',
        'dark:bg-surface-dark-elevated hover:border-neutral-400 dark:border-white/10 dark:text-white',
        className
      )}
    >
      {placeholder && (
        <option key={placeholder} value="">
          {placeholder}
        </option>
      )}
      {groups &&
        groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.choices.map(renderOption)}
          </optgroup>
        ))}
      {choices && choices.map(renderOption)}
      {children}
    </select>
  );
}
