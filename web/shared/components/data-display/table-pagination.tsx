"use client";

import { memo } from "react";
import { TablePaginationProps } from "@/shared";

/**
 * Table pagination component
 */
export const TablePagination = memo(function TablePagination({
    hasPrevious,
    hasNext,
    label,
    onPrevious,
    onNext,
    loading = false,
}: TablePaginationProps) {
    return (
        <s-stack
            direction="inline"
            background="subdued"
            padding="small"
            gap="small-200"
            alignItems="center"
            justifyContent="center"
        >
            <s-button
                variant="secondary"
                disabled={!hasPrevious || loading}
                onClick={onPrevious}
                icon="caret-left"
                accessibilityLabel="Previous page"
            />

            <s-text color="subdued">{label}</s-text>

            <s-button
                variant="secondary"
                disabled={!hasNext || loading}
                onClick={onNext}
                icon="caret-right"
                accessibilityLabel="Next page"
            />
        </s-stack>
    );
});
