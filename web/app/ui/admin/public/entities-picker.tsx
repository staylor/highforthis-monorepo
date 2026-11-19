import { clientEntry, css, on, type Handle } from 'remix/component';

import { select as selectStyle } from './styles.ts';

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
            mix={[
              selectStyle,
              on('change', (event) => {
                const select = event.currentTarget;
                const choice = choices.find((entity) => entity.id === select.value);
                // Back to the placeholder, so the same artist can be picked again after removing it
                select.value = '';
                if (choice && !picked.some((entity) => entity.id === choice.id)) {
                  picked.push(choice);
                  handle.update();
                }
              }),
            ]}
          >
            <option value="">{placeholder}</option>
            {choices.map((entity) => (
              <option value={entity.id}>{entity.name}</option>
            ))}
          </select>
          {picked.length > 0 && (
            <p mix={css({ marginBlock: '0.5rem 2rem' })}>
              {picked.map((entity, i) => (
                <span mix={css({ marginLeft: '0.5rem' })} key={entity.id}>
                  {entity.name}
                  <button
                    type="button"
                    aria-label={`${removeLabel} ${entity.name}`}
                    mix={[
                      css({
                        position: 'relative',
                        top: '0.25rem',
                        marginLeft: '0.125rem',
                        display: 'inline-flex',
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: 'pointer',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pink)',
                      }),
                      on('click', () => {
                        selected = picked.filter((other) => other.id !== entity.id);
                        handle.update();
                      }),
                    ]}
                  >
                    <svg
                      mix={css({ width: '0.875rem', height: '0.875rem' })}
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
