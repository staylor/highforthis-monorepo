import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { inputBase } from './styles.ts';

// Picking from the select adds an artist, each has a button to remove it, and the form submits
// them as hidden artists[0], artists[1] and so on. A show lists an artist once.

interface Entity {
  id: string;
  name: string;
}

interface EntitiesPickerProps {
  name: string;
  selected: Entity[];
  choices: Entity[];
  placeholder: string;
  /** Translated "Remove", which each remove button's label starts with. */
  removeLabel: string;
  id?: string;
}

export const EntitiesPicker = clientEntry(
  import.meta.url,
  function EntitiesPicker(handle: Handle<EntitiesPickerProps>) {
    let selected: Entity[] | null = null;
    const current = () => (selected ??= [...handle.props.selected]);

    return () => {
      const { name, choices, placeholder, removeLabel, id } = handle.props;
      const picked = current();
      return (
        <>
          <select
            id={id}
            class={cn(inputBase, 'rounded-lg border-neutral-300 bg-white text-sm')}
            mix={on('change', (event) => {
              const select = event.currentTarget;
              const choice = choices.find((entity) => entity.id === select.value);
              // Back to the placeholder, so the same artist can be picked again after removing it
              select.value = '';
              if (choice && !picked.some((entity) => entity.id === choice.id)) {
                picked.push(choice);
                handle.update();
              }
            })}
          >
            <option value="">{placeholder}</option>
            {choices.map((entity) => (
              <option value={entity.id}>{entity.name}</option>
            ))}
          </select>
          {picked.length > 0 && (
            <p class="mt-2 mb-8">
              {picked.map((entity, i) => (
                <span class="ml-2" key={entity.id}>
                  {entity.name}
                  <button
                    type="button"
                    aria-label={`${removeLabel} ${entity.name}`}
                    class="relative top-1 ml-0.5 inline-flex size-5 cursor-pointer items-center justify-center text-pink"
                    mix={on('click', () => {
                      selected = picked.filter((other) => other.id !== entity.id);
                      handle.update();
                    })}
                  >
                    <svg
                      class="size-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <input type="hidden" name={`${name}[${i}]`} value={entity.id} />
                </span>
              ))}
            </p>
          )}
        </>
      );
    };
  }
);
