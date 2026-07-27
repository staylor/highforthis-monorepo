import cn from 'classnames';
import { NavLink as RRNavLink } from 'react-router';

import Icon from '#/components/Icon';
import type { AdminTopLevelRoute } from '#/types';

import { adminPath } from '../utils';

interface NavLinkProps {
  item: AdminTopLevelRoute;
  isActive: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
  hasSubNav: boolean;
  onToggle: () => void;
}

function NavLink({ item, isActive, isCollapsed, isExpanded, hasSubNav, onToggle }: NavLinkProps) {
  const path = adminPath(item);
  const showDisclosure = hasSubNav && !isCollapsed;

  return (
    <div className="relative">
      <RRNavLink
        to={path}
        end
        title={isCollapsed ? item.label : undefined}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noreferrer' : undefined}
        className={cn(
          'flex items-center rounded-lg text-sm font-medium no-underline',
          'transition-colors duration-150 outline-none',
          'focus-visible:ring-pink/50 focus-visible:ring-2',
          isCollapsed ? 'h-10 w-10 justify-center' : 'gap-3 py-2 pr-9 pl-2.5',
          isActive
            ? 'bg-pink/10 text-pink visited:text-pink dark:bg-pink/15'
            : cn(
                'text-neutral-600 visited:text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                'dark:text-neutral-400 dark:visited:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white'
              )
        )}
      >
        <Icon name={item.icon} className="h-5 w-5" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
        {!isCollapsed && item.external && (
          <Icon name="external" className="ml-auto h-3.5 w-3.5 opacity-40" />
        )}
      </RRNavLink>

      {/* active indicator for the collapsed rail */}
      {isCollapsed && isActive && (
        <i className="bg-pink absolute top-1/2 -left-2 h-5 w-1 -translate-y-1/2 rounded-r-full" />
      )}

      {showDisclosure && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={item.label}
          className={cn(
            'absolute top-1/2 right-1 -translate-y-1/2 rounded-md p-1',
            'text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700',
            'focus-visible:ring-pink/50 focus-visible:ring-2 focus-visible:outline-none',
            'dark:hover:bg-white/10 dark:hover:text-white'
          )}
        >
          <Icon
            name="chevronDown"
            className={cn('h-3.5 w-3.5 transition-transform duration-200', {
              '-rotate-90': !isExpanded,
            })}
          />
        </button>
      )}
    </div>
  );
}

export default NavLink;
