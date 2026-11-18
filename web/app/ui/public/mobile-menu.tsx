import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from './cn.ts';
import { DarkMode } from './dark-mode.tsx';
import { NavLink } from './nav-link.tsx';

interface MobileMenuProps {
  pathname: string;
  labels: Record<'menu' | 'home' | 'podcast' | 'shows' | 'videos' | 'darkMode', string>;
}

/**
 * The mobile menu toggle and overlay. Client navigation reconciles this entry in place and
 * keeps its state, so it closes itself when the pathname prop changes.
 */
export const MobileMenu = clientEntry(
  import.meta.url,
  function MobileMenu(handle: Handle<MobileMenuProps>) {
    let isOpen = false;
    let lastPathname = handle.props.pathname;

    return () => {
      const { pathname, labels } = handle.props;
      if (pathname !== lastPathname) {
        lastPathname = pathname;
        isOpen = false;
      }

      return (
        <>
          <button
            type="button"
            class="flex items-center lg:hidden"
            aria-label={labels.menu}
            aria-expanded={isOpen}
            mix={on('click', () => {
              isOpen = !isOpen;
              handle.update();
            })}
          >
            <svg
              class="size-6 text-neutral-700 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
          {isOpen && (
            <nav
              class={cn(
                'absolute top-full right-4 z-50 w-56 rounded-xl lg:hidden',
                'dark:bg-surface-dark border border-neutral-200 bg-white shadow-lg dark:border-white/10',
                'p-5'
              )}
            >
              <div class="flex flex-col gap-4">
                <NavLink href="/" pathname={pathname}>
                  {labels.home}
                </NavLink>
                <NavLink href="/podcast" pathname={pathname}>
                  {labels.podcast}
                </NavLink>
                <NavLink href="/shows" pathname={pathname}>
                  {labels.shows}
                </NavLink>
                <NavLink href="/videos" pathname={pathname}>
                  {labels.videos}
                </NavLink>
                <div class="mt-2">
                  <DarkMode id="dark-mode-mobile" label={labels.darkMode} />
                </div>
              </div>
            </nav>
          )}
        </>
      );
    };
  }
);
