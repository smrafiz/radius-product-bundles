/**
 * Analytics state types
 */

import { SortField, SortOrder } from "@/features/analytics";

/**
 * Analytics state
 */
export interface AnalyticsState {
    startDate: string;
    endDate: string;
    days: number;
    preset: string;
    setDateRange: (start: string, end: string, preset?: string) => void;
    setDays: (days: number) => void;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * All bundles table state interface
 */
export interface AllBundlesTableState {
    // Search state
    searchQuery: string;
    showSearch: boolean;

    // Sort state
    sortBy: SortField;
    sortOrder: SortOrder;

    // Pagination state
    page: number;
    perPage: number;

    // Actions
    setSearchQuery: (query: string) => void;
    setShowSearch: (show: boolean) => void;
    toggleSearch: () => void;
    clearSearch: () => void;
    setSortBy: (field: SortField) => void;
    setSortOrder: (order: SortOrder) => void;
    toggleSortOrder: () => void;
    handleSort: (field: SortField) => void;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    resetFilters: () => void;
}
