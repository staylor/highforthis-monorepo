import cn from 'classnames';
import type { RefAttributes } from 'react';

import Icon from '#/components/Icon';

interface Props extends RefAttributes<HTMLDivElement> {
  active: boolean;
  onMouseDown: () => void;
}

function BlockButton({ active, onMouseDown, ref }: Props) {
  return (
    <div
      className={cn(
        'text-detail hover:text-detail-dark',
        'toolbar-hidden absolute -left-7.5 block cursor-pointer transition-[scale]'
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
      <Icon name={active ? 'closeCircle' : 'plusCircle'} className="h-6 w-6" />
    </div>
  );
}

export default BlockButton;
