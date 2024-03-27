import cn from 'classnames';
import type { HTMLAttributes } from 'react';

import { Heading1 } from '@/components/Heading';

export default function PostTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <Heading1 {...props} className={cn('border-pink border-l-8 py-2 pl-2.5', className)} />;
}
