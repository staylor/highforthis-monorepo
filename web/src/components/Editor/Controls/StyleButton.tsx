import cn from 'classnames';
import type { ReactNode, SyntheticEvent } from 'react';

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
        'flex h-7 w-7 items-center justify-center',
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
