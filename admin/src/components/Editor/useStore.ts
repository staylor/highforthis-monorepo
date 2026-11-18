import { useSyncExternalStore } from 'react';

import type { Store } from './core/store';

/** Renders from one of the editor's stores, again each time it changes. */
export default function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
