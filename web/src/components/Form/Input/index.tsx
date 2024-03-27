import type { ChangeEvent, InputHTMLAttributes } from 'react';
import cn from 'classnames';

import { inputBase } from '@/components/Form/styles';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
  inputType?: 'url' | 'email' | 'number' | 'password';
}

export default function Input({ inputType, value, onChange, className, ...props }: InputProps) {
  const inputOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) {
      return;
    }

    const newValue = e.target.value || '';
    onChange(newValue);
  };

  return (
    <input
      type={inputType || 'text'}
      {...props}
      onChange={onChange ? inputOnChange : undefined}
      className={cn(inputBase, 'w-full', className)}
      defaultValue={value}
    />
  );
}
