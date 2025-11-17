"use client";

import { useEffect } from "react";
import { useDebounce } from "@/shared";
import { BUNDLE_FILTERS, useBundleListingStore } from "@/features/bundles";

export function useBundleFilters() {
    const {
        filters,
        setSearch,
        setStatusFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    } = useBundleListingStore();

    const { queryValue, setQueryValue } = useBundleListingStore();
    const debouncedQuery = useDebounce(
        queryValue,
        BUNDLE_FILTERS.search.debounceMs,
    );

    // Sync debounced search to store
    useEffect(() => {
        setSearch(debouncedQuery);
    }, [debouncedQuery, setSearch]);

    return {
        filters,
        queryValue,
        setQueryValue,
        setSearch,
        setStatusFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    };
}
