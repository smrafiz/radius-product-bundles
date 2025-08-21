import { useCallback } from "react";
import { useProductSelectionStore } from "@/lib/stores/productSelectionStore";

export function useQueryBuilder() {
    const { debouncedSearch, searchBy, filters } = useProductSelectionStore();

    const buildSearchQuery = useCallback(() => {
        let query = "";

        const statusFilter = filters.status;

        if (!statusFilter || statusFilter === "ALL") {
            query = `status:DRAFT OR status:ACTIVE OR status:ARCHIVED`;
        } else {
            query = `status:${statusFilter}`;
        }

        const cleanSearch = debouncedSearch
            ?.replace(/^["']+|["']+$/g, '')
            ?.trim();

        // Add search term if exists
        if (cleanSearch && cleanSearch.length > 0) {
            const searchTerm = debouncedSearch.trim();
            let searchQuery = "";

            switch (searchBy) {
                case "title":
                    searchQuery = `title:*${searchTerm}*`;
                    break;
                case "sku":
                    searchQuery = `sku:*${searchTerm}*`;
                    break;
                case "barcode":
                    searchQuery = `barcode:*${searchTerm}*`;
                    break;
                default:
                    searchQuery = `*${searchTerm}*`;
            }

            query += ` AND ${searchQuery}`;
        }

        // Add other filters
        if (filters.productType) {
            query += ` AND product_type:"${filters.productType}"`;
        }
        if (filters.vendor) {
            query += ` AND vendor:"${filters.vendor}"`;
        }
        if (filters.collection) {
            query += ` AND collection_id:${filters.collection}`;
        }
        if (filters.tags.length > 0) {
            const tagsQuery = filters.tags
                .map((tag) => `tag:"${tag}"`)
                .join(" OR ");
            query += ` AND (${tagsQuery})`;
        }

        return query;
    }, [debouncedSearch, searchBy, filters]);

    return { buildSearchQuery };
}