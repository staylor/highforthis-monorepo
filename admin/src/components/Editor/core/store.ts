type Listener = () => void;

/**
 * A value that changes as the editor does, for whatever draws the editor's controls to read and
 * watch: React through `useSyncExternalStore`, or any other UI framework.
 */
export interface Store<T> {
  get: () => T;
  subscribe: (listener: Listener) => () => void;
}

export function createStore<T>(initial: T, isEqual: (a: T, b: T) => boolean = Object.is) {
  let value = initial;
  const listeners = new Set<Listener>();

  return {
    get: () => value,
    set(next: T) {
      if (isEqual(value, next)) {
        return;
      }
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** True when both objects hold the same values, one level deep. */
export function shallowEqual<T extends object>(a: T, b: T) {
  const keys = Object.keys(a) as (keyof T)[];
  return keys.length === Object.keys(b).length && keys.every((key) => Object.is(a[key], b[key]));
}
