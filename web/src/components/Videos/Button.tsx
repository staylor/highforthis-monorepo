import cn from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

const Button = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'box-border cursor-pointer appearance-none bg-white',
      'border-detail border transition-colors',
      'mr-2 inline-block px-2 py-1.5 text-center text-base uppercase dark:text-black',
      'hover:outline-hidden focus:outline-hidden active:outline-hidden',
      'hover:text-black focus:text-black active:text-black',
      'hover:border-black focus:border-black active:border-black',
      className
    )}
    type="button"
    {...props}
  />
);

export default Button;
