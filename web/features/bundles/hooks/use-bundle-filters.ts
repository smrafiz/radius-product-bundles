"use client";

import { useEffect } from "react";
import { useDebounce } from "@/shared";
import { useBundleListingStore, BUNDLE_FILTERS } from "@/features/bundles";

/**
 * Handles debounced search + syncing with store
 */
export function useBundleFilters() {
    const {
        filters,
        setSearch,
        setStatusFilter,
        setTypeFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    } = useBundleListingStore();

    // Local value stored in Zustand instead of useState
    const { queryValue, setQueryValue } = useBundleListingStore();

    // Debounce value
    const debouncedQuery = useDebounce(queryValue, BUNDLE_FILTERS.search.debounceMs);

    // Sync debounced query to store
    useEffect(() => {
        setSearch(debouncedQuery);
    }, [debouncedQuery, setSearch]);

    // Sync reset when store clears search
    useEffect(() => {
        if (filters.search === "" && queryValue !== "") {
            setQueryValue("");
        }
    }, [filters.search]);

    return {
        filters,
        queryValue,
        setQueryValue,
        setSearch,
        setStatusFilter,
        setTypeFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
    };
}