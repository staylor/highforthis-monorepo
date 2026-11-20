import { clientEntry, css, navigate, on, type Handle } from 'remix/component';

import { colorTransition, dark, text } from '#/ui/public/styles.ts';

/**
 * The year picker needs JavaScript because the year is a path segment (/videos/:year),
 * not a query a GET form could submit.
 */
export const YearSelect = clientEntry(
  import.meta.url,
  function YearSelect(handle: Handle<{ value: string; placeholder: string; years: number[] }>) {
    return () => (
      <select
        mix={[
          css({
            marginBlock: '0.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            borderColor: 'light-dark(var(--neutral-300), rgb(255 255 255 / 0.1))',
            backgroundColor: 'light-dark(#fff, var(--surface-dark-elevated))',
            paddingBlock: 0,
            paddingRight: '2.25rem',
            ...text.sm,
            boxShadow: 'var(--shadow-xs)',
            ...colorTransition,
            [dark]: { color: 'var(--dark)' },
            '&:hover': { borderColor: 'var(--neutral-400)' },
            '&:focus': {
              borderColor: 'var(--pink)',
              boxShadow: '0 0 0 3px var(--pink-200), var(--shadow-xs)',
            },
          }),
          on('change', (event) => {
            const year = event.currentTarget.value;
            navigate(year ? `/videos/${year}` : '/videos');
          }),
        ]}
      >
        <option value="">{handle.props.placeholder}</option>
        {handle.props.years.map((year) => (
          <option value={String(year)} selected={String(year) === handle.props.value}>
            {year}
          </option>
        ))}
      </select>
    );
  }
);
