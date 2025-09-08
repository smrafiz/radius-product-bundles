import { useCallback } from "react";
import { Pagination } from "@shopify/polaris";
import { useBundleListingStore } from "@/stores";

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

    if (!hasNext && !hasPrevious) {
        return null;
    }

    return (
        <div className="flex items-center justify-center p-6 bg-[var(--p-color-bg-surface-secondary)] border-t-[var(--p-color-border)] border-solid border-t">
            <Pagination
                hasPrevious={hasPrevious}
                onPrevious={handlePreviousPage}
                hasNext={hasNext}
                onNext={handleNextPage}
                label={label}
            />
        </div>
    );
}
