"use client";

import { useCallback, useEffect, useRef } from "react";
import { useIndexResourceState } from "@shopify/polaris";
import { useBundleListingStore } from "@/features/bundles";
import { SelectionType } from "@shopify/polaris/build/ts/src/utilities/index-provider";

/**
 * Bundle selection
 */
export function useBundleSelection(bundles: any[]) {
    const showToast = useBundleListingStore((s) => s.showToast);
    const safeBundles = Array.isArray(bundles) ? bundles : [];

    const resourceIDResolver = (bundle: any) => bundle.id;
    const indexResourceState = useIndexResourceState(safeBundles, {
        resourceIDResolver,
    });

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        indexResourceState;
    const clearSelectionRef = useRef<(() => void) | null>(null);

    // Capture clearSelection when it exists (only when items are selected)
    useEffect(() => {
        if (
            "clearSelection" in indexResourceState &&
            typeof (indexResourceState as any).clearSelection === "function"
        ) {
            clearSelectionRef.current = (
                indexResourceState as any
            ).clearSelection;
        }
    }, [indexResourceState, selectedResources.length]);

    // Stable clearSelection function that uses the ref
    const clearSelection = useCallback(() => {
        if (clearSelectionRef.current) {
            clearSelectionRef.current();
        } else {
            // Fallback if the ref is not set
            handleSelectionChange("page" as SelectionType, false);
        }
    }, [handleSelectionChange]);

    // Clear selection with toast
    const handleClearSelection = useCallback(() => {
        clearSelection();
        showToast("Selection cleared");
    }, [clearSelection, showToast]);

    // Get selected bundle for single selection
    const selectedBundle =
        selectedResources.length === 1
            ? safeBundles.find((bundle) => bundle.id === selectedResources[0])
            : null;

    return {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
        handleClearSelection,
        selectedBundle,
    };
}
