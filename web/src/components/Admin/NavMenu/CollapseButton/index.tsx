import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import Icon from '#/components/Icon';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

function CollapseButton({ isCollapsed, onClick }: CollapseButtonProps) {
  const { t } = useTranslation();
  const label = isCollapsed ? t('nav.expand') : t('nav.collapse');
  return (
    <div className="shrink-0 border-t border-neutral-200/80 p-2 dark:border-white/10">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={!isCollapsed}
        aria-label={label}
        title={isCollapsed ? label : undefined}
        className={cn(
          'flex items-center rounded-lg text-sm font-medium text-neutral-500 transition-colors',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'focus-visible:ring-pink/50 focus-visible:ring-2 focus-visible:outline-none',
          'dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white',
          isCollapsed ? 'h-10 w-10 justify-center' : 'w-full gap-3 px-2.5 py-2'
        )}
      >
        <Icon
          name="chevronLeft"
          className={cn('h-4 w-4 transition-transform duration-200', { 'rotate-180': isCollapsed })}
        />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </button>
    </div>
  );
}

export default CollapseButton;
