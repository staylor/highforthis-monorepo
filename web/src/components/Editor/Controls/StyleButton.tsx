import type { ReactNode, SyntheticEvent } from 'react';
import cn from 'classnames';

interface StyleButtonProps {
  style: string;
  onToggle: (prop: string) => void;
  className: string;
  active: boolean;
  label: ReactNode;
}

function StyleButton({ label, style, onToggle, className, active }: StyleButtonProps) {
  const onMouseDown = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(style);
  };

  return (
    <span
      role="button"
      tabIndex={-1}
      className={cn(
        'inline-block h-8 w-auto overflow-hidden px-1.5 leading-8',
        'cursor-pointer first:rounded-l last:rounded-r',
        className,
        {
          'text-detail hover:text-dark': !active,
          'text-dark hover:text-pink': active,
        }
      )}
      onMouseDown={onMouseDown}
    >
      {label}
    </span>
  );
}

export default StyleButton;
