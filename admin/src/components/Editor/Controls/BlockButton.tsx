import cn from 'classnames';
import type { CSSProperties } from 'react';

import Icon from '#/components/Icon';

interface Props {
  active: boolean;
  onMouseDown: () => void;
  style?: CSSProperties;
}

function BlockButton({ active, onMouseDown, style }: Props) {
  return (
    <div
      className={cn(
        'text-detail hover:text-detail-dark',
        'toolbar-hidden absolute -left-7.5 block cursor-pointer transition-[scale]'
      )}
      style={style}
      role="button"
      tabIndex={0}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();

        onMouseDown();
      }}
    >
      <Icon name={active ? 'closeCircle' : 'plusCircle'} className="size-6" />
    </div>
  );
}

export default BlockButton;
