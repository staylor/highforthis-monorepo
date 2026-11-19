import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '#/components/Icon';
import { cn } from '#/utils/cn';

interface Props {
  active: boolean;
  onMouseDown: () => void;
  style?: CSSProperties;
}

function BlockButton({ active, onMouseDown, style }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'text-detail hover:text-detail-dark',
        'toolbar-hidden absolute -left-7.5 block cursor-pointer transition-[scale]'
      )}
      style={style}
      role="button"
      aria-label={t('editor.blockTypes')}
      aria-expanded={active}
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
