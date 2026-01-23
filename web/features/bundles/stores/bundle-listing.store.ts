import { create } from "zustand";
import { BundleListingState } from "@/features/bundles";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getBundlesAction } from "@/features/bundles/actions";

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
            selectedTab: 0,
            sortSelected: "createdAt desc",
        },
        pagination: {
            currentPage: 1,
            itemsPerPage: 2,
            totalItems: 0,
            totalPages: 0,
        },
        toast: {
            active: false,
            message: "",
        },
        queryValue: "",
        viewBundle: null,

        // Selection state
        selectedResources: [],

        // Data actions
        setBundles: (bundles) =>
            set({
                bundles: Array.isArray(bundles) ? bundles : [],
            }),
        setMetrics: (metrics) => set({ metrics }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        // Selection actions
        setSelectedResources: (ids) => set({ selectedResources: ids }),
        clearSelection: () => set({ selectedResources: [] }),
        toggleSelection: (id) =>
            set((state) => ({
                selectedResources: state.selectedResources.includes(id)
                    ? state.selectedResources.filter((item) => item !== id)
                    : [...state.selectedResources, id],
            })),
        toggleAllSelection: (allIds) =>
            set((state) => ({
                selectedResources:
                    state.selectedResources.length === allIds.length
                        ? []
                        : allIds,
            })),

        // Filter actions - clears selection
        setSearch: (search) =>
            set((state) => ({
                filters: { ...state.filters, search },
                pagination: { ...state.pagination, currentPage: 1 },
                selectedResources: [],
            })),
        setStatusFilter: (statusFilter) =>
            set((state) => ({
                filters: { ...state.filters, statusFilter },
                pagination: { ...state.pagination, currentPage: 1 },
                selectedResources: [],
            })),
        setSelectedTab: (selectedTab) =>
            set((state) => ({
                filters: { ...state.filters, selectedTab },
                pagination: { ...state.pagination, currentPage: 1 },
                selectedResources: [],
            })),
        setSortSelected: (sortSelected) =>
            set((state) => ({
                filters: { ...state.filters, sortSelected },
                pagination: { ...state.pagination, currentPage: 1 },
                selectedResources: [],
            })),
        clearFilters: () =>
            set((state) => ({
                filters: {
                    ...state.filters,
                    search: "",
                    statusFilter: [],
                    typeFilter: [],
                    selectedTab: 0,
                    sortSelected: "createdAt desc",
                },
                queryValue: "",
                pagination: { ...state.pagination, currentPage: 1 },
                selectedResources: [],
            })),
        setQueryValue: (value) => set({ queryValue: value }),

        // Pagination actions - clears selection
        setCurrentPage: (currentPage) =>
            set((state) => ({
                pagination: { ...state.pagination, currentPage },
                selectedResources: [],
            })),

        setItemsPerPage: (itemsPerPage) =>
            set((state) => ({
                pagination: {
                    ...state.pagination,
                    itemsPerPage,
                    currentPage: 1,
                },
                selectedResources: [],
            })),

        setPaginationMetadata: (metadata: {
            totalItems: number;
            totalPages: number;
        }) =>
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
            const safeBundles = Array.isArray(bundles) ? bundles : [];
            return safeBundles.filter((bundle) => bundle.status === "ACTIVE")
                .length;
        },

        getTotalBundlesCount: () => {
            const { pagination } = get();
            return pagination.totalItems || 0;
        },

        getTotalPages: () => {
            const { pagination } = get();
            return (
                pagination.totalPages ||
                Math.ceil(pagination.totalItems / pagination.itemsPerPage)
            );
        },

        getPaginationInfo: () => {
            const { pagination } = get();
            const totalPages = pagination.totalPages || 1;
            const { currentPage, itemsPerPage, totalItems } = pagination;

            const startIndex =
                totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
            const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

            return {
                startIndex,
                endIndex,
                hasNext: pagination.currentPage < totalPages,
                hasPrevious: pagination.currentPage > 1,
                label:
                    totalPages > 0
                        ? `Showing page ${pagination.currentPage} of ${totalPages}`
                        : "Showing page 1 of 1",
            };
        },

        getFilteredBundles: () => {
            const { bundles, filters } = get();
            const safeBundles = Array.isArray(bundles) ? bundles : [];
            let filtered = [...safeBundles];

            // Apply search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter((bundle) =>
                    bundle.name.toLowerCase().includes(searchLower),
                );
            }

            // Apply status filter
            if (filters.statusFilter && filters.statusFilter.length > 0) {
                filtered = filtered.filter((bundle) =>
                    filters.statusFilter?.includes(bundle.status),
                );
            }

            return filtered;
        },

        openViewBundle: (bundle) =>
            set({
                viewBundle: bundle,
            }),

        closeViewBundle: () =>
            set({
                viewBundle: null,
            }),

        getPaginatedBundles: () => {
            const { pagination } = get();
            const filteredBundles = get().getFilteredBundles();

            const startIndex =
                (pagination.currentPage - 1) * pagination.itemsPerPage;
            const endIndex = startIndex + pagination.itemsPerPage;

            return filteredBundles.slice(startIndex, endIndex);
        },

        updateBundleInStore: (bundleId, data) =>
            set((state) => {
                const safeBundles = Array.isArray(state.bundles)
                    ? state.bundles
                    : [];
                const index = safeBundles.findIndex((b) => b.id === bundleId);
                if (index === -1) return state;

                const updated = { ...safeBundles[index], ...data };
                const bundles = [...safeBundles];
                bundles[index] = updated;

                return { bundles };
            }),

        removeBundleFromStore: (bundleId: string) =>
            set((state) => {
                const safeBundles = Array.isArray(state.bundles)
                    ? state.bundles
                    : [];
                return {
                    bundles: safeBundles.filter(
                        (bundle) => bundle.id !== bundleId,
                    ),
                    // Also remove from selection if selected
                    selectedResources: state.selectedResources.filter(
                        (id) => id !== bundleId,
                    ),
                };
            }),

        refreshBundles: async (page: number = 1, itemsPerPage: number = 10) => {
            try {
                set({ loading: true });
                const app = useAppBridge();
                const token = await app.idToken();
                const result = await getBundlesAction(
                    token,
                    page,
                    itemsPerPage,
                );

                if (result.status === "success") {
                    set({
                        bundles: Array.isArray(result.data) ? result.data : [],
                        loading: false,
                        pagination: {
                            ...get().pagination,
                            currentPage: page,
                            itemsPerPage: itemsPerPage,
                            totalItems:
                                result.data?.pagination?.totalItems ?? 0,
                            totalPages:
                                result.data?.pagination?.totalPages ?? 0,
                        },
                        selectedResources: [], // Clear selection on refresh
                    });
                } else {
                    set({
                        error: result.message,
                        loading: false,
                        bundles: [],
                    });
                }
            } catch (error: any) {
                set({
                    error: error.message || "Failed to refresh bundles",
                    loading: false,
                    bundles: [],
                });
            }
        },
    }),
);
