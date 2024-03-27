import cn from 'classnames';
import type { LegacyRef } from 'react';
import { forwardRef } from 'react';

const Toolbar = forwardRef<LegacyRef<HTMLDivElement>, any>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cn(
      'absolute z-50 scale-0 rounded bg-white shadow-lg transition-transform',
      'after:border-l-1.5 after:border-transparent after:border-t-white',
      'after:pointer-events-none after:absolute after:right-1/2 after:-bottom-3 after:h-0 after:w-0',
      'after:[&.Toolbar-flush]:border-t-transparent',
      className
    )}
  />
));

Toolbar.displayName = 'Toolbar';

export default Toolbar;
