import cn from 'classnames';
import type { OlHTMLAttributes, HTMLAttributes } from 'react';

export const orderedListBase = 'list-decimal my-5 ml-8';
export const unorderedListBase = 'list-disc my-5 ml-8';

export const OrderedList = ({ className, ...props }: OlHTMLAttributes<HTMLOListElement>) => (
  <ol className={cn(orderedListBase, className)} {...props} />
);

export const UnorderedList = ({ className, ...props }: HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn(unorderedListBase, className)} {...props} />
);
