import { useMemo } from "react";
import type { SelectedItem, ProductGroup } from "@/types";

/**
 * Hook to group selected items by productId.
 * Separates variants from main products and memoizes the result.
 */
export function useGroupedProducts(items: SelectedItem[]): ProductGroup[] {
    return useMemo(() => {
        const groups: Record<string, ProductGroup> = {};

        items.forEach((item) => {
            if (!groups[item.productId]) {
                groups[item.productId] = {
                    product: item,
                    variants: [],
                    originalTotalVariants: item.totalVariants || 1,
                };
            }

            if (item.type === "variant") {
                groups[item.productId].variants.push(item);
            }
        });

        return Object.values(groups);
    }, [items]);
}
