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
          />
        </label>
      </div>
    );
  }
);
