import { create } from "zustand";
import { getBundles } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

import type { BundleListingState, BundleListItem } from "@/types";

export const useBundleListingStore = create<BundleListingState>()(
    (set, get) => ({
        // Initial state
        bundles: [],
        metrics: null,
        loading: true,
        error: null,
        filters: {
            search: "",
            statusFilter: [],
            typeFilter: [],
            selectedTab: 0,
            sortSelected: ["createdAt desc"],
        },
        pagination: {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
        },
        toast: {
            active: false,
            message: "",
        },

        // Data actions
        setBundles: (bundles) => set({ bundles }),
        setMetrics: (metrics) => set({ metrics }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        // Filter actions
        setSearch: (search) =>
            set((state) => ({
                filters: { ...state.filters, search },
                pagination: { ...state.pagination, currentPage: 1 }, // Reset to first page
            })),

        setStatusFilter: (statusFilter) =>
            set((state) => ({
                filters: { ...state.filters, statusFilter },
                pagination: { ...state.pagination, currentPage: 1 },
            })),

        setTypeFilter: (typeFilter) =>
            set((state) => ({
                filters: { ...state.filters, typeFilter },
                pagination: { ...state.pagination, currentPage: 1 },
            })),

        setSelectedTab: (selectedTab) =>
            set((state) => ({
                filters: { ...state.filters, selectedTab },
                pagination: { ...state.pagination, currentPage: 1 },
            })),

        setSortSelected: (sortSelected) =>
            set((state) => ({
                filters: { ...state.filters, sortSelected },
                pagination: { ...state.pagination, currentPage: 1 },
            })),

        clearFilters: () =>
            set((state) => ({
                filters: {
                    ...state.filters,
                    search: "",
                    statusFilter: [],
                    typeFilter: [],
                    selectedTab: 0,
                },
                pagination: { ...state.pagination, currentPage: 1 },
            })),

        // Pagination actions
        setCurrentPage: (currentPage) =>
            set((state) => ({
                pagination: { ...state.pagination, currentPage },
            })),

        setItemsPerPage: (itemsPerPage) =>
            set((state) => ({
                pagination: {
                    ...state.pagination,
                    itemsPerPage,
                    currentPage: 1,
                },
            })),

        setPaginationMetadata: (metadata: { totalItems: number; totalPages: number }) =>
            set((state) => ({
                pagination: {
                    ...state.pagination,
                    totalItems: metadata.totalItems,
                    totalPages: metadata.totalPages,
                },
            })),

        // Toast actions
        showToast: (message) =>
            set({
                toast: {
                    active: true,
                    message,
                },
            }),

        hideToast: () =>
            set({
                toast: {
                    active: false,
                    message: "",
                },
            }),

        // Computed getters
        getActiveBundlesCount: () => {
            const { bundles } = get();
            return bundles.filter((bundle) => bundle.status === "ACTIVE")
                .length;
        },

        getTotalBundlesCount: () => {
            const { pagination } = get();
            return pagination.totalItems || 0;
        },

        getTotalPages: () => {
            const { pagination } = get();
            return pagination.totalPages ||
                Math.ceil(pagination.totalItems / pagination.itemsPerPage);
        },

        getPaginationInfo: () => {
            const { pagination } = get();
            const totalPages = pagination.totalPages || 1;

            return {
                hasNext: pagination.currentPage < totalPages,
                hasPrevious: pagination.currentPage > 1,
                label: totalPages > 0
                    ? `Showing page ${pagination.currentPage} of ${totalPages}`
                    : "Showing page 1 of 1",
            };
        },

        updateBundleInStore: (bundleId, data) =>
            set((state) => {
                const index = state.bundles.findIndex((b) => b.id === bundleId);
                if (index === -1) return state;

                const updated = { ...state.bundles[index], ...data };
                const bundles = [...state.bundles];
                bundles[index] = updated;

                return { bundles };
            }),

        removeBundleFromStore: (bundleId: string) =>
            set((state) => ({
                bundles: state.bundles.filter(bundle => bundle.id !== bundleId)
            })),

        refreshBundles: async (page: number = 1, itemsPerPage: number = 10) => {
            try {
                set({ loading: true });
                const app = useAppBridge();
                const token = await app.idToken();
                const result = await getBundles(token, page, itemsPerPage);

                if (result.status === "success") {
                    set({
                        bundles: result.data ?? [],
                        loading: false,
                        pagination: {
                            ...get().pagination,
                            currentPage: page,
                            itemsPerPage: itemsPerPage,
                        }
                    });
                } else {
                    set({ error: result.message, loading: false });
                }
            } catch (error: any) {
                set({
                    error: error.message || "Failed to refresh bundles",
                    loading: false,
                });
            }
        },
    }),
);
