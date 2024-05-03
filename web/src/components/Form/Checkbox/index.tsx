import cn from 'classnames';
import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

export default function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [checked, setChecked] = useState(props.checked);
  const [value, setValue] = useState(props.value || 'false');
  const onChange = (e: any) => {
    setValue(e.target.checked);
    setChecked(e.target.checked);
  };
  const handler: any = props.onChange || onChange;
  return (
    <input
      {...props}
      onChange={handler}
      value={value}
      checked={checked}
      className={cn(
        'text-pink focus:border-pink focus:ring-pink rounded border-gray-300 shadow-sm focus:ring focus:ring-opacity-50 focus:ring-offset-0',
        className
      )}
      type="checkbox"
    />
  );
}
