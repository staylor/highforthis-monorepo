import cn from 'classnames';
import type { HTMLAttributes, RefAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>;

function Toolbar({ className, ref, ...props }: Props) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'toolbar-hidden absolute z-50 rounded border border-gray-200 bg-white p-1 shadow-lg transition-[scale]',
        'after:border-l-1.5 after:border-transparent after:border-t-white',
        'after:pointer-events-none after:absolute after:right-1/2 after:-bottom-3 after:h-0 after:w-0',
        'after:[&.Toolbar-flush]:border-t-transparent',
        className
      )}
    />
  );
}

export default Toolbar;
