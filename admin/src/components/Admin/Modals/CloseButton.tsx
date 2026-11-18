import cn from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

import Icon from '#/components/Icon';

const CloseButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    aria-label="Close"
    className={cn(
      className,
      'z-close text-dark absolute top-2.5 right-2.5 flex cursor-pointer items-center size-6',
      'justify-center rounded-full transition-colors hover:bg-neutral-100'
    )}
    {...props}
  >
    <Icon name="close" className="size-4" />
  </button>
);

export default CloseButton;
