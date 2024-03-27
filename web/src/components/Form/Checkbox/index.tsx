import cn from 'classnames';
import type { InputHTMLAttributes } from 'react';

export default function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'text-pink focus:border-pink focus:ring-pink rounded border-gray-300 shadow-sm focus:ring focus:ring-opacity-50 focus:ring-offset-0',
        className
      )}
      type="checkbox"
    />
  );
}
