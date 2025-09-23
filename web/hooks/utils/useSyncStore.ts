import { useEffect } from "react";
import type { StoreApi } from "zustand";

/**
 * useSyncStore - generic hook to sync one store's state to another
 *
 * @param sourceStore - Zustand store to observe
 * @param selector - function to select what part of the source store to sync
 * @param targetStore - Zustand store to update
 * @param updater - function to update the target store based on the source state
 */
export function useSyncStore<SourceState, TargetState>(
    sourceStore: StoreApi<SourceState>,
    selector: (state: SourceState) => any,
    targetStore: StoreApi<TargetState>,
    updater: (target: TargetState, value: any) => Partial<TargetState>,
) {
    useEffect(() => {
        const unsubscribe = sourceStore.subscribe((value) => {
            targetStore.setState((prev) => updater(prev, selector(value)));
        });

        return () => unsubscribe();
    }, [sourceStore, targetStore, selector, updater]);
}
