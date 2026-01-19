"use client";

/**
 * All Bundles Table Store
 *
 * Manages pagination, search, and sort state for the all bundles table.
 */

import { create } from "zustand";
import { SortField, SortOrder } from "@/features/analytics";

/**
 * All bundles table state interface
 */
export interface AllBundlesTableState {
    // Search state
    searchQuery: string;

    // Sort state
    sortBy: SortField;
    sortOrder: SortOrder;

    // Pagination state
    page: number;
    perPage: number;

    // Actions
    setSearchQuery: (query: string) => void;
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

/**
 * Default values for the store
 */
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 2;
const DEFAULT_SORT_BY: SortField = "revenue";
const DEFAULT_SORT_ORDER: SortOrder = "desc";

/**
 * All bundles table store
 *
 * Centralized state management for the all bundles analytics table.
 * Handles search, sorting, and pagination with server-side support.
 */
export const useAllBundlesTableStore = create<AllBundlesTableState>((set) => ({
    // Initial state
    searchQuery: "",
    sortBy: DEFAULT_SORT_BY,
    sortOrder: DEFAULT_SORT_ORDER,
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PER_PAGE,

    /**
     * Set the search query
     */
    setSearchQuery: (query: string) => {
        set({
            searchQuery: query,
            page: DEFAULT_PAGE, // Reset to first page on search
        });
    },

    /**
     * Set the sort field
     */
    setSortBy: (field: SortField) => {
        set({
            sortBy: field,
            page: DEFAULT_PAGE,
        });
    },

    /**
     * Set the sort order
     */
    setSortOrder: (order: SortOrder) => {
        set({
            sortOrder: order,
            page: DEFAULT_PAGE,
        });
    },

    /**
     * Toggle the sort order between asc and desc
     */
    toggleSortOrder: () => {
        set((state) => ({
            sortOrder: state.sortOrder === "desc" ? "asc" : "desc",
            page: DEFAULT_PAGE,
        }));
    },

    /**
     * Handle sort column click
     *
     * If clicking the same column, toggle order.
     * If clicking a new column, set it with desc order.
     */
    handleSort: (field: SortField) => {
        set((state) => {
            if (state.sortBy === field) {
                return {
                    sortOrder: state.sortOrder === "desc" ? "asc" : "desc",
                    page: DEFAULT_PAGE,
                };
            }
            return {
                sortBy: field,
                sortOrder: "desc",
                page: DEFAULT_PAGE,
            };
        });
    },

    /**
     * Set the current page
     */
    setPage: (page: number) => {
        set({ page: Math.max(1, page) });
    },

    /**
     * Set items per page
     */
    setPerPage: (perPage: number) => {
        set({
            perPage: Math.max(1, Math.min(100, perPage)),
            page: DEFAULT_PAGE,
        });
    },

    /**
     * Go to next page
     */
    nextPage: () => {
        set((state) => ({ page: state.page + 1 }));
    },

    /**
     * Go to previous page
     */
    prevPage: () => {
        set((state) => ({ page: Math.max(1, state.page - 1) }));
    },

    /**
     * Reset all filters to defaults
     */
    resetFilters: () => {
        set({
            searchQuery: "",
            sortBy: DEFAULT_SORT_BY,
            sortOrder: DEFAULT_SORT_ORDER,
            page: DEFAULT_PAGE,
            perPage: DEFAULT_PER_PAGE,
        });
    },
}));
