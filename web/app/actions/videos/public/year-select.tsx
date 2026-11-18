import { clientEntry, navigate, on, type Handle } from 'remix/component';

/**
 * The year picker needs JavaScript because the year is a path segment (/videos/:year),
 * not a query a GET form could submit.
 */
export const YearSelect = clientEntry(
  import.meta.url,
  function YearSelect(handle: Handle<{ value: string; placeholder: string; years: number[] }>) {
    return () => (
      <select
        class="my-1 mr-1 h-9 rounded-lg border-neutral-300 bg-white py-0 pr-9 text-sm shadow-xs transition-colors last:mr-0 hover:border-neutral-400 focus:border-pink focus:ring-3 focus:ring-pink-200 dark:border-white/10 dark:bg-surface-dark-elevated dark:text-dark"
        mix={on('change', (event) => {
          const year = event.currentTarget.value;
          navigate(year ? `/videos/${year}` : '/videos');
        })}
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
