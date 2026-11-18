import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from './cn.ts';

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
 * data-rmx-preserve-attrs="class" keeps client navigation from resetting it.
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
      <div class="flex items-center">
        <label
          class="relative inline-block h-6 w-12"
          for={handle.props.id}
          aria-label={handle.props.label}
        >
          <input
            type="checkbox"
            id={handle.props.id}
            class="peer hidden"
            checked={checked}
            mix={on('change', (event) => {
              checked = event.currentTarget.checked;
              if (checked) {
                storage((store) => store.setItem(STORAGE_KEY, '1'));
              } else {
                storage((store) => store.removeItem(STORAGE_KEY));
              }
              document.documentElement.classList.toggle('dark', checked);
              handle.update();
            })}
          />
          <div
            class={cn(
              'absolute inset-0 cursor-pointer rounded-full border transition-colors duration-300',
              'border-neutral-200 bg-neutral-200',
              'dark:bg-surface-dark-card dark:border-white/10',
              'before:absolute before:bottom-0.5 before:left-0.5 before:size-5',
              'before:rounded-full before:bg-white before:shadow-sm before:transition-transform before:duration-300',
              'peer-checked:before:translate-x-6',
              'peer-checked:before:bg-pink'
            )}
          />
        </label>
        <span class="sr-only">{handle.props.label}</span>
      </div>
    );
  }
);
