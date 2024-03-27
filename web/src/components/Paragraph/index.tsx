import cn from 'classnames';
import type { HTMLAttributes } from 'react';

export const paragraphBase = 'mb-6';

const Paragraph = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn(paragraphBase, className)} {...props} />
);

export default Paragraph;
