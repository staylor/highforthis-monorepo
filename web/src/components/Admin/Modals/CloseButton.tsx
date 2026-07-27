import cn from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

import Icon from '#/components/Icon';

const CloseButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    aria-label="Close"
    className={cn(
      className,
      'z-close text-dark absolute top-2.5 right-2.5 flex h-6 w-6 cursor-pointer items-center',
      'justify-center rounded-full transition-colors hover:bg-neutral-100'
    )}
    {...props}
  >
    <Icon name="close" className="h-4 w-4" />
  </button>
);

export default CloseButton;
