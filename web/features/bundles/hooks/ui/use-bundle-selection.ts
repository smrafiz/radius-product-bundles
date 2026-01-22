"use client";

import { useCallback, useMemo, useState } from "react";
import { useBundleListingStore } from "@/features/bundles";

type ResourceId = string;

export function useBundleSelection<T extends { id: ResourceId }>(
    bundles: T[],
) {
    const showToast = useBundleListingStore((s) => s.showToast);

    const safeBundles = Array.isArray(bundles) ? bundles : [];

    const [selectedResources, setSelectedResources] = useState<ResourceId[]>([]);

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
        if (allResourcesSelected) {
            setSelectedResources([]);
        } else {
            setSelectedResources(safeBundles.map((b) => b.id));
        }
    }, [allResourcesSelected, safeBundles]);

    /**
     * Row checkbox
     */
    const toggleSelection = useCallback((id: ResourceId) => {
        setSelectedResources((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    }, []);

    /**
     * Explicit clear (Cancel / Bulk cancel)
     */
    const clearSelection = useCallback(() => {
        setSelectedResources([]);
        showToast("Selection cleared");
    }, [showToast]);

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
