import cn from 'classnames';
import type { HTMLAttributes } from 'react';

const CloseButton = ({ className, onClick, ...props }: HTMLAttributes<HTMLElement>) => (
  <i
    onClick={onClick}
    className={cn(
      className,
      'z-close text-dark absolute right-2.5 top-2.5 block h-5 w-5 cursor-pointer text-xl'
    )}
    {...props}
  />
);

export default CloseButton;
