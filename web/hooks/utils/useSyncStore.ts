import { useEffect } from "react";
import type { StoreApi } from "zustand";

export function useSyncStore<SourceState, TargetState, Value>(
    sourceStore: StoreApi<SourceState>,
    selector: (state: SourceState) => Value,
    targetStore: StoreApi<TargetState>,
    updater: (prev: TargetState, value: Value) => Partial<TargetState>
) {
    useEffect(() => {
        let prevValue = selector(sourceStore.getState());

        return sourceStore.subscribe((state) => {
            const currentValue = selector(state);

            // Only update if the selected value actually changed
            if (currentValue !== prevValue) {
                targetStore.setState((prev) => updater(prev, currentValue));
                prevValue = currentValue;
            }
        });
    }, [sourceStore, targetStore, selector, updater]);
}