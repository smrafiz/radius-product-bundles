"use client";

import { useCallback, useMemo } from "react";
import { useBundleListingStore } from "@/features/bundles";

/**
 * Hook for bundle table selection.
 *
 * Uses store state so selection clears automatically when pagination/filters change.
 */
export function useBundleSelection<T extends { id: string }>(bundles: T[]) {
    const selectedResources = useBundleListingStore((s) => s.selectedResources);
    const storeToggleSelection = useBundleListingStore((s) => s.toggleSelection);
    const storeToggleAllSelection = useBundleListingStore((s) => s.toggleAllSelection);
    const storeClearSelection = useBundleListingStore((s) => s.clearSelection);

    const safeBundles = Array.isArray(bundles) ? bundles : [];
    const allIds = safeBundles.map((b) => b.id);

    /**
     * All selected?
     */
    const allResourcesSelected = useMemo(() => {
        return (
            safeBundles.length > 0 &&
            selectedResources.length === safeBundles.length
        );
    }, [safeBundles.length, selectedResources.length]);

    /**
     * Header checkbox (select / clear all)
     */
    const toggleAllSelection = useCallback(() => {
        storeToggleAllSelection(allIds);
    }, [storeToggleAllSelection, allIds]);

    /**
     * Row checkbox
     */
    const toggleSelection = useCallback(
        (id: string) => {
            storeToggleSelection(id);
        },
        [storeToggleSelection],
    );

    /**
     * Explicit clear (Cancel / Bulk cancel)
     */
    const clearSelection = useCallback(() => {
        storeClearSelection();
    }, [storeClearSelection]);

    /**
     * Single selected bundle
     */
    const selectedBundle = useMemo(() => {
        if (selectedResources.length !== 1) return null;
        return safeBundles.find((b) => b.id === selectedResources[0]) ?? null;
    }, [safeBundles, selectedResources]);

    return {
        selectedResources,
        allResourcesSelected,
        toggleAllSelection,
        toggleSelection,
        clearSelection,
        selectedBundle,
    };
}
