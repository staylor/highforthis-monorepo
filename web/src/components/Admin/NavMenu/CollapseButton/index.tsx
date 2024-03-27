import cn from 'classnames';
import type { SyntheticEvent } from 'react';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: (e: SyntheticEvent) => void;
}

function CollapseButton({ isCollapsed, onClick }: CollapseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative m-0 block h-9 w-full cursor-pointer overflow-visible p-0',
        'border-none bg-none outline-0 transition-colors hover:text-black',
        'text-sm leading-9'
      )}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
    >
      <span
        className={cn(
          'absolute left-0 top-0 block h-9 w-9 leading-9',
          'before:relative before:top-2',
          'dashicons-before before:content-collapse',
          {
            'rotate-180': isCollapsed,
          }
        )}
      />
      {!isCollapsed && (
        <span className="absolute left-0 top-0 block pl-9 leading-9">Collapse menu</span>
      )}
    </button>
  );
}

export default CollapseButton;
