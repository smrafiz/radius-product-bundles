"use client";

import { useCallback, useState } from "react";
import { useBundleListingStore } from "@/features/bundles";

/**
 * Custom bundle selection hook for web components
 * Replaces Polaris useIndexResourceState
 */
export function NewuseBundleSelection(bundles: any[]) {
    const showToast = useBundleListingStore((s) => s.showToast);
    const safeBundles = Array.isArray(bundles) ? bundles : [];

    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [allResourcesSelected, setAllResourcesSelected] = useState(false);

    /**
     * Handle selection change
     * Mimics Polaris SelectionType behavior
     */
    const handleSelectionChange = useCallback(
        (
            selectionType: string,
            isSelecting: boolean,
            selection?: string | string[],
        ) => {
            switch (selectionType) {
                case "single":
                    // Single item toggle
                    if (typeof selection === "string") {
                        setSelectedResources((prev) =>
                            isSelecting
                                ? [...prev, selection]
                                : prev.filter((id) => id !== selection),
                        );
                    }
                    break;

                case "all":
                case "page":
                    // Select/deselect all
                    if (isSelecting) {
                        const allIds = safeBundles.map((b) => b.id);
                        setSelectedResources(allIds);
                        setAllResourcesSelected(true);
                    } else {
                        setSelectedResources([]);
                        setAllResourcesSelected(false);
                    }
                    break;

                case "multi":
                    // Multiple items
                    if (Array.isArray(selection)) {
                        setSelectedResources(selection);
                        setAllResourcesSelected(
                            selection.length === safeBundles.length &&
                                safeBundles.length > 0,
                        );
                    }
                    break;

                default:
                    // Direct update (custom)
                    if (Array.isArray(selection)) {
                        setSelectedResources(selection);
                        setAllResourcesSelected(
                            selection.length === safeBundles.length &&
                                safeBundles.length > 0,
                        );
                    }
                    break;
            }
        },
        [safeBundles],
    );

    /**
     * Clear all selections
     */
    const clearSelection = useCallback(() => {
        setSelectedResources([]);
        setAllResourcesSelected(false);
    }, []);

    /**
     * Clear selection with toast notification
     */
    const handleClearSelection = useCallback(() => {
        clearSelection();
        showToast("Selection cleared");
    }, [clearSelection, showToast]);

    /**
     * Get selected bundle for single selection
     */
    const selectedBundle =
        selectedResources.length === 1
            ? safeBundles.find((bundle) => bundle.id === selectedResources[0])
            : null;

    /**
     * Toggle single item selection
     */
    const toggleSelection = useCallback(
        (bundleId: string) => {
            setSelectedResources((prev) => {
                const isSelected = prev.includes(bundleId);
                const newSelection = isSelected
                    ? prev.filter((id) => id !== bundleId)
                    : [...prev, bundleId];

                // Update "all selected" state
                setAllResourcesSelected(
                    newSelection.length === safeBundles.length &&
                        safeBundles.length > 0,
                );

                return newSelection;
            });
        },
        [safeBundles],
    );

    /**
     * Toggle all items selection
     */
    const toggleAllSelection = useCallback(() => {
        if (
            allResourcesSelected ||
            selectedResources.length === safeBundles.length
        ) {
            setSelectedResources([]);
            setAllResourcesSelected(false);
        } else {
            const allIds = safeBundles.map((b) => b.id);
            setSelectedResources(allIds);
            setAllResourcesSelected(true);
        }
    }, [allResourcesSelected, selectedResources.length, safeBundles]);

    return {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
        handleClearSelection,
        selectedBundle,
        toggleSelection,
        toggleAllSelection,
    };
}
