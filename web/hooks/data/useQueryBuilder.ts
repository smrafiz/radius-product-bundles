import { useCallback } from "react";
import { useProductSelectionStore } from "@/stores";

export function useQueryBuilder() {
    const { debouncedSearch, searchBy, filters } = useProductSelectionStore();

    const buildSearchQuery = useCallback(() => {
        let query = "";

        // Search term
        const cleanSearch = debouncedSearch
            ?.replace(/^["']+|["']+$/g, "")
            ?.trim();

        if (cleanSearch && cleanSearch.length > 0) {
            switch (searchBy) {
                case "title":
                    query += `title:*${cleanSearch}*`;
                    break;
                case "sku":
                    query += `sku:*${cleanSearch}*`;
                    break;
                case "barcode":
                    query += `barcode:*${cleanSearch}*`;
                    break;
                default:
                    query += `*${cleanSearch}*`;
            }
        }

        // Status filter
        if (filters.status && filters.status !== "ALL") {
            if (query) query += " ";
            query += `status:${filters.status}`;
        }

        // Collection filter
        if (filters.collection) {
            const numericId = filters.collection.split("/").pop();
            if (numericId) {
                if (query) query += " ";
                query += `collection_id:${numericId}`;
            }
        }

        // Other filters
        if (filters.productType) {
            if (query) query += " ";
            query += `product_type:"${filters.productType}"`;
        }

        if (filters.vendor) {
            if (query) query += " ";
            query += `vendor:"${filters.vendor}"`;
        }

        if (filters.tags.length > 0) {
            const tagsQuery = filters.tags
                .map((tag) => `tag:"${tag}"`)
                .join(" OR ");
            if (query) query += " ";
            query += `(${tagsQuery})`;
        }

        return query;
    }, [debouncedSearch, searchBy, filters]);

    return { buildSearchQuery };
}
