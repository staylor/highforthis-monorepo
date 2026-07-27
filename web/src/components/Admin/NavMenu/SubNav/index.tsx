import cn from 'classnames';
import { NavLink } from 'react-router';

import type { AdminTopLevelRoute } from '#/types';

import { adminPath } from '../utils';

interface SubNavProps {
  item: AdminTopLevelRoute;
  isCollapsed: boolean;
  isExpanded: boolean;
  isHovered: boolean;
}

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block truncate rounded-md px-2.5 py-1.5 text-[13px] no-underline transition-colors',
    isActive
      ? 'text-pink visited:text-pink font-semibold'
      : cn(
          'text-neutral-500 visited:text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
          'dark:text-neutral-400 dark:visited:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white'
        )
  );

function SubNav({ item, isCollapsed, isExpanded, isHovered }: SubNavProps) {
  // collapsed rail: show a flyout panel on hover/focus. expanded: inline accordion.
  const isFlyout = isCollapsed;
  const isVisible = isFlyout ? isHovered : isExpanded;

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        isFlyout
          ? cn(
              'absolute top-0 left-full z-50 ml-2 min-w-44 rounded-xl p-2 shadow-xl',
              'dark:bg-surface-dark-card border border-neutral-200/80 bg-white dark:border-white/10'
            )
          : 'mt-0.5 mb-1 ml-5 border-l border-neutral-200 pl-2 dark:border-white/10'
      )}
    >
      {isFlyout && (
        <div className="px-2.5 pt-1 pb-2 text-xs font-semibold tracking-wide text-neutral-900 uppercase dark:text-white">
          {item.label}
        </div>
      )}
      {item.routes?.map((route) => {
        const path = adminPath(route);
        return (
          <NavLink className={linkClassName} end key={path} to={path}>
            {route.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export default SubNav;
