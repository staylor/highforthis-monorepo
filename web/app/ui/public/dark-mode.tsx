import { clientEntry, css, on, type Handle } from 'remix/component';

import { colorTransition, srOnly } from './styles.ts';

const STORAGE_KEY = 'darkMode';

function storage(action: (store: Storage) => string | null | void) {
  try {
    return action(localStorage);
  } catch {
    return null;
  }
}

// What the switch turns on: the moon shows beside the knob in the light, and the sun in the dark,
// since the knob covers the other
const icons = {
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20.4 14.5A8.5 8.5 0 0 1 9.5 3.6a8.5 8.5 0 1 0 10.9 10.9Z',
};

const icon = css({
  position: 'absolute',
  top: '50%',
  width: '0.75rem',
  height: '0.75rem',
  translate: '0 -50%',
  color: 'var(--muted)',
});

/**
 * The <html> class is set before paint by the inline script in Document, and
 * data-rmx-preserve-attrs="class" keeps client navigation from resetting it. The checkbox is
 * hidden from view but not from the keyboard or a screen reader: Tab reaches it, which rings
 * the switch drawn after it, and Space flips it.
 */
export const DarkMode = clientEntry(
  import.meta.url,
  function DarkMode(handle: Handle<{ id: string; label: string }>) {
    let checked = false;

    handle.queueTask(() => {
      checked = Boolean(storage((store) => store.getItem(STORAGE_KEY)));
      handle.update();
    });

    return () => (
      <div mix={css({ display: 'flex', alignItems: 'center' })}>
        <label
          mix={css({
            position: 'relative',
            display: 'inline-block',
            height: '1.5rem',
            width: '3rem',
          })}
          for={handle.props.id}
        >
          <input
            type="checkbox"
            id={handle.props.id}
            aria-label={handle.props.label}
            mix={[
              srOnly,
              on('change', (event) => {
                checked = event.currentTarget.checked;
                if (checked) {
                  storage((store) => store.setItem(STORAGE_KEY, '1'));
                } else {
                  storage((store) => store.removeItem(STORAGE_KEY));
                }
                document.documentElement.classList.toggle('dark', checked);
                handle.update();
              }),
            ]}
            checked={checked}
          />
          {/* The track, with the knob as its ::before */}
          <div
            mix={css({
              position: 'absolute',
              inset: 0,
              cursor: 'pointer',
              borderRadius: '9999px',
              border: '1px solid light-dark(var(--neutral-200), rgb(255 255 255 / 0.1))',
              backgroundColor: 'light-dark(var(--neutral-200), var(--surface-dark-card))',
              ...colorTransition,
              transitionDuration: '300ms',
              '&::before': {
                content: '""',
                position: 'absolute',
                zIndex: 1,
                bottom: '0.125rem',
                left: '0.125rem',
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '9999px',
                backgroundColor: '#fff',
                boxShadow: 'var(--shadow-sm)',
                transition: 'translate 300ms var(--ease)',
              },
              ':checked + &::before': {
                translate: '1.5rem 0',
                backgroundColor: 'var(--pink)',
              },
              ':focus-visible + &': { outline: '2px solid var(--pink)', outlineOffset: '2px' },
            })}
          >
            {(['sun', 'moon'] as const).map((name) => (
              <svg
                key={name}
                mix={icon}
                style={name === 'sun' ? { left: '0.3125rem' } : { right: '0.3125rem' }}
                viewBox="0 0 24 24"
                fill={name === 'moon' ? 'currentColor' : 'none'}
                stroke="currentColor"
                stroke-width={2}
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d={icons[name]} />
              </svg>
            ))}
          </div>
        </label>
      </div>
    );
  }
);
