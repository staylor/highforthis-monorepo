import { clientEntry, css, on, type Handle } from 'remix/component';

import { DarkMode } from './dark-mode.tsx';
import { NavLink } from './nav-link.tsx';
import { lg } from './styles.ts';

interface MobileMenuProps {
  pathname: string;
  /** The site's pages, as the header lists them on wider screens. */
  links: { href: string; label: string }[];
  labels: Record<'menu' | 'darkMode', string>;
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
      const { pathname, links, labels } = handle.props;
      if (pathname !== lastPathname) {
        lastPathname = pathname;
        isOpen = false;
      }

      return (
        <>
          <button
            type="button"
            aria-label={labels.menu}
            aria-expanded={isOpen}
            mix={[
              css({
                display: 'flex',
                alignItems: 'center',
                [lg]: { display: 'none' },
              }),
              on('click', () => {
                isOpen = !isOpen;
                handle.update();
              }),
            ]}
          >
            <svg
              mix={css({
                width: '1.5rem',
                height: '1.5rem',
                color: 'light-dark(var(--neutral-700), #fff)',
              })}
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
              mix={css({
                position: 'absolute',
                top: '100%',
                right: '1rem',
                zIndex: 50,
                width: '14rem',
                borderRadius: '0.75rem',
                border: '1px solid light-dark(var(--neutral-200), rgb(255 255 255 / 0.1))',
                backgroundColor: 'light-dark(#fff, var(--surface-dark))',
                boxShadow: 'var(--shadow-lg)',
                padding: '1.25rem',
                [lg]: { display: 'none' },
              })}
            >
              <div
                mix={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                })}
              >
                {links.map(({ href, label }) => (
                  <NavLink href={href} pathname={pathname}>
                    {label}
                  </NavLink>
                ))}
                <div mix={css({ marginTop: '0.5rem' })}>
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
