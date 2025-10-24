import { useMemo } from "react";
import { groupProductsById, ProductPreviewGroup } from "@/features/bundles";

/**
 * Bundle preview
 */
export function useBundlePreview(products: ProductPreviewGroup[]) {
    return useMemo(() => {
        const grouped = groupProductsById(products);
        const display = grouped.slice(0, 3);
        const total = grouped.length;

        return {
            groupedProducts: grouped,
            displayProducts: display,
            remainingCount: Math.max(0, total - 3),
            arrowClass: total === 2 ? "-left-7" : "-left-2",
        };
    }, [products]);
}
