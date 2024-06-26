type MemoCache = Array<number | typeof $empty>;
declare const $empty: unique symbol;
export declare function unstable_useMemoCache(size: number): any[];
export declare function $read(memoCache: MemoCache, index: number): number;
declare enum GuardKind {
    PushGuardContext = 0,
    PopGuardContext = 1,
    PushExpectHook = 2,
    PopExpectHook = 3
}
export declare function $dispatcherGuard(kind: GuardKind): void;
export declare function $reset($: MemoCache): void;
export declare function $makeReadOnly(): void;
export declare const renderCounterRegistry: Map<string, Set<{
    count: number;
}>>;
export declare function clearRenderCounterRegistry(): void;
export declare function useRenderCounter(name: string): void;
export {};
