"use client";

import { useCallback } from "react";
import { useBundleListingStore } from "@/features/bundles";
import { TablePagination } from "@/shared";

/**
 * Bundle pagination
 */
export function BundlePagination() {
    const pagination = useBundleListingStore((s) => s.pagination);
    const loading = useBundleListingStore((s) => s.loading);
    const setCurrentPage = useBundleListingStore((s) => s.setCurrentPage);
    const getPaginationInfo = useBundleListingStore((s) => s.getPaginationInfo);

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
