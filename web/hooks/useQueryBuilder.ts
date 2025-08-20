import { useCallback } from "react";
import { useProductSelectionStore } from "@/lib/stores/productSelectionStore";

export function useQueryBuilder() {
    const { debouncedSearch, searchBy, filters } = useProductSelectionStore();

    const buildSearchQuery = useCallback(() => {
        let query = "";

        if (debouncedSearch) {
            switch (searchBy) {
                case "title":
                    query += `title:*${debouncedSearch}*`;
                    break;
                case "sku":
                    query += `sku:*${debouncedSearch}*`;
                    break;
                case "barcode":
                    query += `barcode:*${debouncedSearch}*`;
                    break;
                default:
                    query += `*${debouncedSearch}*`;
            }
        }

        // Add filters
        if (filters.status) {
            query += query
                ? ` AND status:${filters.status}`
                : `status:${filters.status}`;
        } else {
            query += query ? ` AND status:ACTIVE` : `status:ACTIVE`;
        }

        if (filters.productType) {
            query += query
                ? ` AND product_type:"${filters.productType}"`
                : `product_type:"${filters.productType}"`;
        }
        if (filters.vendor) {
            query += query
                ? ` AND vendor:"${filters.vendor}"`
                : `vendor:"${filters.vendor}"`;
        }
        if (filters.collection) {
            query += query
                ? ` AND collection_id:${filters.collection}`
                : `collection_id:${filters.collection}`;
        }
        if (filters.tags.length > 0) {
            const tagsQuery = filters.tags
                .map((tag) => `tag:"${tag}"`)
                .join(" OR ");
            query += query ? ` AND (${tagsQuery})` : `(${tagsQuery})`;
        }

        return query || "status:ACTIVE";
    }, [debouncedSearch, searchBy, filters]);

    return { buildSearchQuery };
}
