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
        'toolbar-hidden absolute -left-7.5 block cursor-pointer transition-[scale]',
        'dashicons',
        {
          'dashicons-plus-alt': !active,
          'dashicons-no': active,
        }
      )}
      ref={ref as any}
      role="button"
      tabIndex={0}
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
