"use client";

import { useCallback } from "react";
import { useBundleListingStore } from "@/features/bundles";

/**
 * Bundle pagination with web components
 */
export function NewBundlePagination() {
    const { pagination, setCurrentPage, getPaginationInfo } =
        useBundleListingStore();

    const { hasNext, hasPrevious, label } = getPaginationInfo();

    const handlePreviousPage = useCallback(() => {
        if (hasPrevious) {
            setCurrentPage(pagination.currentPage - 1);
        }
    }, [hasPrevious, pagination.currentPage, setCurrentPage]);

    const handleNextPage = useCallback(() => {
        if (hasNext) {
            setCurrentPage(pagination.currentPage + 1);
        }
    }, [hasNext, pagination.currentPage, setCurrentPage]);

    return (
        <s-box
            padding="base"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--p-color-bg-surface-secondary)",
                borderTop: "1px solid var(--p-color-border)",
            }}
        >
            <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-button
                    variant="secondary"
                    icon="arrow-left"
                    onClick={handlePreviousPage}
                    disabled={!hasPrevious}
                    accessibilityLabel="Previous page"
                />

                <s-text variant="bodyMd" fontWeight="medium">
                    {label}
                </s-text>

                <s-button
                    variant="secondary"
                    icon="arrow-right"
                    onClick={handleNextPage}
                    disabled={!hasNext}
                    accessibilityLabel="Next page"
                />
            </s-stack>
        </s-box>
    );
}
