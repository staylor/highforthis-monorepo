import cn from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

const Button = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'box-border cursor-pointer appearance-none bg-white',
      'border-detail border transition-colors',
      'mr-2 inline-block py-1.5 px-2  text-center text-base uppercase dark:text-black',
      'hover:outline-none focus:outline-none active:outline-none',
      'hover:text-black focus:text-black active:text-black',
      'hover:border-black focus:border-black active:border-black',
      className
    )}
    type="button"
    {...props}
  />
);

export default Button;
