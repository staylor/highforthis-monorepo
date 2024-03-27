import type { TextareaHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import { inputBase } from '@/components/Form/styles';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

export default function Textarea({ onChange, className, value, ...props }: TextareaProps) {
  const inputOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!onChange) {
      return;
    }
    const newValue = e.target.value || '';
    onChange(newValue);
  };
  return (
    <textarea
      {...props}
      onChange={onChange ? inputOnChange : undefined}
      className={cn(inputBase, 'w-full', className)}
      defaultValue={value}
    />
  );
}
