"use client";

import { useCallback } from "react";
import { useBundleListingStore } from "@/features/bundles";

/**
 * Bundle pagination
 */
export function BundlePagination() {
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
        <s-stack
            direction="inline"
            background="subdued"
            padding="small"
            gap="small-200"
            alignItems="center"
            justifyContent="center"
        >
            {/* Previous Button */}
            <s-button
                variant="secondary"
                disabled={!hasPrevious}
                onClick={handlePreviousPage}
                icon="caret-left"
            />

            <s-text color="subdued">{label}</s-text>

            <s-button
                variant="secondary"
                disabled={!hasNext}
                onClick={handleNextPage}
                icon="caret-right"
            />
        </s-stack>
    );
}
