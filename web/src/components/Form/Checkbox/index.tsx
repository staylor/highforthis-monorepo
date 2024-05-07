import cn from 'classnames';
import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

export default function Checkbox({
  className,
  value: valueProp,
  checked: checkedProp,
  onChange: onChangeProp,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [checked, setChecked] = useState(checkedProp);
  const initial = typeof valueProp === 'undefined' ? String(checked) : valueProp;
  const [value, setValue] = useState(initial);
  const onChange = (e: any) => {
    setValue(e.target.checked);
    setChecked(e.target.checked);
  };
  const handler: any = onChangeProp || onChange;
  return (
    <input
      {...props}
      onChange={handler}
      value={value}
      defaultChecked={checked}
      className={cn(
        'text-pink focus:border-pink focus:ring-pink rounded border-gray-300 shadow-sm focus:ring focus:ring-opacity-50 focus:ring-offset-0',
        className
      )}
      type="checkbox"
    />
  );
}
