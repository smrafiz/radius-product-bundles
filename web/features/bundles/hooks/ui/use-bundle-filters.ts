"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/shared";
import {
    BUNDLE_FILTERS,
    BUNDLE_SORT_OPTIONS,
    useBundleListingStore,
} from "@/features/bundles";

/**
 * Hook for bundle filters
 */
export function useBundleFilters() {
    const {
        filters,
        setSearch,
        setStatusFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,
        queryValue,
        setQueryValue,
    } = useBundleListingStore();

    // Debounced search
    const debouncedQuery = useDebounce(
        queryValue,
        BUNDLE_FILTERS.search.debounceMs,
    );

    // UI state
    const [showSearch, setShowSearch] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Sync debounced search to store
    useEffect(() => {
        setSearch(debouncedQuery);
    }, [debouncedQuery, setSearch]);

    /**
     * Autofocus search field when shown
     */
    useEffect(() => {
        if (showSearch && searchContainerRef.current) {
            const timer = setTimeout(() => {
                const searchField =
                    searchContainerRef.current?.querySelector("s-search-field");
                if (searchField) {
                    const input =
                        searchField.shadowRoot?.querySelector("input") ||
                        searchField.querySelector("input");
                    if (input) {
                        input.focus();
                    }
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [showSearch]);

    /**
     * Handle search input change
     */
    const handleSearchInput = useCallback(
        (event: Event) => {
            const target = event.target as HTMLInputElement;
            setQueryValue(target.value);
        },
        [setQueryValue],
    );

    /**
     * Handle status filter change
     */
    const handleStatusFilterChange = useCallback(
        (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            const form = target.closest("form");
            if (!form) return;

            const formData = new FormData(form);
            const selectedStatuses = formData.getAll("status-filter");

            if (selectedStatuses.length === 0) {
                setSelectedTab(0);
            } else if (selectedStatuses.length === 1) {
                const statusValue = selectedStatuses[0] as string;
                const tabIndex = BUNDLE_FILTERS.tabs.items.findIndex(
                    (item) => item.toLowerCase() === statusValue.toLowerCase(),
                );
                if (tabIndex !== -1) {
                    setSelectedTab(tabIndex);
                }
            }
        },
        [setSelectedTab],
    );

    /**
     * Handle tab selection
     */
    const handleTabClick = useCallback(
        (index: number) => setSelectedTab(index),
        [setSelectedTab],
    );

    /**
     * Toggle search panel
     */
    const toggleFilters = useCallback(() => {
        setShowSearch((prev) => !prev);
    }, []);

    /**
     * Parse current sort selection
     */
    const sortField = useMemo(() => {
        const safeSort = filters.sortSelected || "createdAt desc";
        const parts = safeSort.trim().split(" ");
        return parts[0] || "createdAt";
    }, [filters.sortSelected]);

    /**
     * Get unique sort fields and directions
     */
    const sortFields = useMemo(
        () =>
            Array.from(
                new Map(
                    BUNDLE_SORT_OPTIONS.map((opt) => [opt.field, opt]),
                ).values(),
            ),
        [],
    );

    const sortDirections = useMemo(
        () => BUNDLE_SORT_OPTIONS.filter((opt) => opt.field === sortField),
        [sortField],
    );

    /**
     * Handle sort field change
     */
    const handleSortFieldChange = useCallback(
        (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            const form = target.closest("form");
            if (!form) return;

            const formData = new FormData(form);
            const newField = formData.get("sort-field") as string;
            if (!newField) return;

            const firstOption = BUNDLE_SORT_OPTIONS.find(
                (opt) => opt.field === newField,
            );
            if (firstOption) {
                setSortSelected(
                    `${firstOption.field} ${firstOption.direction}`,
                );
            }
        },
        [setSortSelected],
    );

    /**
     * Handle sort direction button click
     */
    const handleSortDirectionClick = useCallback(
        (value: string) => setSortSelected(value),
        [setSortSelected],
    );

    /**
     * Active filter checks
     */
    const hasSearchQuery = queryValue.trim().length > 0;
    const hasStatusFilter = filters.selectedTab !== 0;

    return {
        // Store state
        filters,
        queryValue,
        setQueryValue,
        setSearch,
        setStatusFilter,
        setSelectedTab,
        setSortSelected,
        clearFilters,

        // UI state
        showSearch,
        searchContainerRef,
        sortField,
        sortFields,
        sortDirections,
        hasSearchQuery,
        hasStatusFilter,

        // Handlers
        handleSearchInput,
        handleStatusFilterChange,
        handleTabClick,
        toggleFilters,
        handleSortFieldChange,
        handleSortDirectionClick,
    };
}
