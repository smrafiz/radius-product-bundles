"use client";

import { PaginationMeta, useAllBundlesPagination } from "@/features/analytics";

/**
 * Pagination Component for All Bundles Table
 *
 * Displays pagination controls with page info and navigation buttons.
 */
export function AllBundlesPagination({ pagination }: { pagination: PaginationMeta }) {
    const { page, setPage, perPage, setPerPage } = useAllBundlesPagination();
    const { total, totalPages, hasNextPage, hasPrevPage } = pagination;

    // Calculate display range
    const startItem = (page - 1) * perPage + 1;
    const endItem = Math.min(page * perPage, total);

    /**
     * Handle previous page click
     */
    const handlePrevious = () => {
        if (hasPrevPage) {
            setPage(page - 1);
        }
    };

    /**
     * Handle next page click
     */
    const handleNext = () => {
        if (hasNextPage) {
            setPage(page + 1);
        }
    };

    /**
     * Handle per page change
     */
    const handlePerPageChange = (e: any) => {
        const newPerPage = parseInt(e.target.value, 10);
        if (!isNaN(newPerPage)) {
            setPerPage(newPerPage);
        }
    };

    return (
        <s-box padding="base" border="base" borderStyle="solid none none none">
            <s-stack
                direction="inline"
                gap="base"
                alignItems="center"
                justifyContent="space-between"
            >
                {/* Page info */}
                <s-text tone="neutral">
                    Showing {startItem}-{endItem} of {total} bundles
                </s-text>

                {/* Navigation controls */}
                <s-stack direction="inline" gap="small-200" alignItems="center">
                    {/* Per page selector */}
                    <s-stack
                        direction="inline"
                        gap="small-100"
                        alignItems="center"
                    >
                        <s-text tone="neutral">Show:</s-text>
                        <s-select
                            value={perPage.toString()}
                            onChange={handlePerPageChange}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </s-select>
                    </s-stack>

                    {/* Page navigation */}
                    <s-stack
                        direction="inline"
                        gap="small-100"
                        alignItems="center"
                    >
                        <s-button
                            variant="tertiary"
                            onClick={handlePrevious}
                            disabled={!hasPrevPage}
                        >
                            <s-icon type="chevron-left" />
                        </s-button>

                        <s-text tone="neutral">
                            Page {page} of {totalPages}
                        </s-text>

                        <s-button
                            variant="tertiary"
                            onClick={handleNext}
                            disabled={!hasNextPage}
                        >
                            <s-icon type="chevron-right" />
                        </s-button>
                    </s-stack>
                </s-stack>
            </s-stack>
        </s-box>
    );
}
