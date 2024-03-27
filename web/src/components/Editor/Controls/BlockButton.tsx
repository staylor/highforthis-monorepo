import cn from 'classnames';
import type { LegacyRef } from 'react';
import { forwardRef } from 'react';

const BlockButton = forwardRef<LegacyRef<HTMLDivElement> | undefined, any>(
  ({ active, onMouseDown }, ref) => (
    <div
      className={cn(
        'text-detail hover:text-detail-dark text-2xl',
        '-left-7.5 absolute block scale-0 cursor-pointer transition-transform',
        'dashicons',
        {
          'dashicons-plus-alt': !active,
          'dashicons-no': active,
        }
      )}
      ref={ref as any}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();

        onMouseDown();
      }}
    >
      {' '}
    </div>
  )
);

BlockButton.displayName = 'BlockButton';

export default BlockButton;
