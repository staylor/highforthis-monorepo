import { clientEntry, css, on, type Handle } from 'remix/component';

import { colorTransition, dark, text } from '#/ui/public/styles.ts';

import { Icon } from './icon.tsx';

// Collapses the sidebar to a rail of icons, or expands it. The state is `data-nav="collapsed"`
// on <html>, which the admin document sets before first paint from the same storage key the
// React admin used, and which client navigation keeps. The shell's styles do the rest.

const STORAGE_KEY = 'adminNavCollapsed';

function isCollapsed() {
  return document.documentElement.dataset.nav === 'collapsed';
}

function remember(collapsed: boolean) {
  try {
    if (collapsed) {
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be off; the choice then lasts until the page is loaded again
  }
}

const button = css({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '0.75rem',
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: 'transparent',
  padding: '0.5rem 0.625rem',
  ...text.sm,
  fontFamily: 'inherit',
  fontWeight: 500,
  cursor: 'pointer',
  color: 'var(--neutral-500)',
  ...colorTransition,
  outline: 'none',
  '&:hover': { backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-900)' },
  '&:focus-visible': { boxShadow: '0 0 0 2px rgb(229 0 130 / 0.5)' },
  [dark]: {
    color: 'var(--neutral-400)',
    '&:hover': { backgroundColor: 'rgb(255 255 255 / 0.05)', color: '#fff' },
  },
  '& svg': { flexShrink: 0, transitionProperty: 'transform', transitionDuration: '200ms' },
  '&[aria-expanded="false"] svg': { transform: 'rotate(180deg)' },
  '&[aria-expanded="false"]': { justifyContent: 'center', paddingInline: 0 },
  '&[aria-expanded="false"] span': { display: 'none' },
});

export const NavCollapse = clientEntry(
  import.meta.url,
  function NavCollapse(handle: Handle<{ collapseLabel: string; expandLabel: string }>) {
    // Rendered expanded on the server; the stored choice is read once the page is in the browser
    let collapsed = false;

    handle.queueTask(() => {
      if (isCollapsed()) {
        collapsed = true;
        handle.update();
      }
    });

    return () => {
      const { collapseLabel, expandLabel } = handle.props;
      const label = collapsed ? expandLabel : collapseLabel;
      return (
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={label}
          title={collapsed ? label : undefined}
          mix={[
            button,
            on('click', () => {
              collapsed = !isCollapsed();
              if (collapsed) {
                document.documentElement.dataset.nav = 'collapsed';
              } else {
                delete document.documentElement.dataset.nav;
              }
              remember(collapsed);
              handle.update();
            }),
          ]}
        >
          <Icon name="chevronLeft" size="1rem" />
          <span>{collapseLabel}</span>
        </button>
      );
    };
  }
);
