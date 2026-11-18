/**
 * Calls `fn` with the latest arguments once calls have stopped for `wait` milliseconds;
 * `cancel()` drops a pending call. Replaces `lodash.debounce`, which is CommonJS.
 */
export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
