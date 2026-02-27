import cn from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

const CloseButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      className,
      'z-close text-dark absolute top-2.5 right-2.5 block h-5 w-5 cursor-pointer text-xl'
    )}
    {...props}
  />
);

export default CloseButton;
