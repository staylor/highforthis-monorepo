import cn from 'classnames';
import type { HTMLAttributes, RefAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>;

function Toolbar({ className, ref, ...props }: Props) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'absolute z-50 scale-0 rounded bg-white shadow-lg transition-transform',
        'after:border-l-1.5 after:border-transparent after:border-t-white',
        'after:pointer-events-none after:absolute after:-bottom-3 after:right-1/2 after:h-0 after:w-0',
        'after:[&.Toolbar-flush]:border-t-transparent',
        className
      )}
    />
  );
}

export default Toolbar;
