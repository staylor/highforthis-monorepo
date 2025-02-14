import cn from 'classnames';
import type { RefAttributes } from 'react';

interface Props extends RefAttributes<HTMLDivElement> {
  active: boolean;
  onMouseDown: () => void;
}

function BlockButton({ active, onMouseDown, ref }: Props) {
  return (
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
  );
}

export default BlockButton;
