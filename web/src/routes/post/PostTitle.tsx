import { Heading1 } from '@highforthis/shared/components/Heading';
import cn from 'classnames';
import type { HTMLAttributes } from 'react';

export default function PostTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <Heading1 {...props} className={cn('border-pink border-l-8 py-2 pl-2.5', className)} />;
}
