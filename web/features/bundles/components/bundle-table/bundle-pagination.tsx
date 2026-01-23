"use client";

import { useCallback } from "react";
import { useBundleListingStore } from "@/features/bundles";
import { TablePagination } from "@/shared";

/**
 * Bundle pagination
 */
export function BundlePagination() {
    const { pagination, setCurrentPage, getPaginationInfo, loading } =
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
        <TablePagination
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            label={label}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            loading={loading}
        />
    );
}
