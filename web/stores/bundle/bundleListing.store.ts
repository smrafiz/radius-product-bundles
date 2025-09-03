import { create } from "zustand";
import type { BundleStatus, BundleType } from "@/types";

export interface BundleListItem {
    id: string;
    name: string;
    type: BundleType;
    status: BundleStatus;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    productCount: number;
    createdAt: string;
}

export interface BundleMetrics {
    totals: {
        revenue: number;
        views: number;
        purchases: number;
        addToCarts: number;
    };
    metrics: {
        conversionRate: number;
        avgOrderValue: number;
        cartConversionRate: number;
    };
    growth: {
        revenue: number;
        conversion: number;
    };
}

interface BundleFilters {
    search: string;
    statusFilter: string[];
    typeFilter: string[];
    selectedTab: number;
    sortSelected: string[];
}

interface Toast {
    active: boolean;
    message: string;
}

interface Pagination {
    currentPage: number;
    itemsPerPage: number;
}

interface BundlesState {
    // Data
    bundles: BundleListItem[];
    metrics: BundleMetrics | null;

    // UI State
    loading: boolean;
    error: string | null;
    filters: BundleFilters;
    pagination: Pagination;
    toast: Toast;

    // Actions
    setBundles: (bundles: BundleListItem[]) => void;
    setMetrics: (metrics: BundleMetrics | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Filter actions
    setSearch: (search: string) => void;
    setStatusFilter: (filter: string[]) => void;
    setTypeFilter: (filter: string[]) => void;
    setSelectedTab: (tab: number) => void;
    setSortSelected: (sort: string[]) => void;
    clearFilters: () => void;

    // Pagination actions
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;

    // Toast actions
    showToast: (message: string) => void;
    hideToast: () => void;

    // Computed getters
    getFilteredBundles: () => BundleListItem[];
    getPaginatedBundles: () => BundleListItem[];
    getActiveBundlesCount: () => number;
    getTotalBundlesCount: () => number;
    getTotalPages: () => number;
    getPaginationInfo: () => {
        startIndex: number;
        endIndex: number;
        hasNext: boolean;
        hasPrevious: boolean;
        label: string;
    };
}

export const useBundleListingStore = create<BundlesState>()((set, get) => ({
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
        sortSelected: ["created_at desc"],
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
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
            pagination: { ...state.pagination, itemsPerPage, currentPage: 1 },
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
    getFilteredBundles: () => {
        const { bundles, filters } = get();
        const itemStrings = [
            "ALL",
            "ACTIVE",
            "DRAFT",
            "PAUSED",
            "SCHEDULED",
            "ARCHIVED",
        ];

        try {
            let filtered = [...bundles];

            // Search filter
            if (filters.search && filters.search.trim()) {
                const searchTerm = filters.search.toLowerCase().trim();
                filtered = filtered.filter(
                    (bundle) =>
                        bundle?.name?.toLowerCase()?.includes(searchTerm) ||
                        false,
                );
            }

            // Status filter
            if (filters.statusFilter && filters.statusFilter.length > 0) {
                filtered = filtered.filter((bundle) =>
                    filters.statusFilter.includes(bundle?.status),
                );
            }

            // Type filter
            if (filters.typeFilter && filters.typeFilter.length > 0) {
                filtered = filtered.filter((bundle) =>
                    filters.typeFilter.includes(bundle?.type),
                );
            }

            // Tab filter
            if (
                filters.selectedTab > 0 &&
                filters.selectedTab < itemStrings.length
            ) {
                const tabStatus = itemStrings[filters.selectedTab];
                if (tabStatus && tabStatus !== "ALL") {
                    filtered = filtered.filter(
                        (bundle) => bundle?.status === tabStatus,
                    );
                }
            }

            // Sort
            if (filters.sortSelected && filters.sortSelected.length > 0) {
                const [sortKey, sortDirection] = filters.sortSelected[0]?.split(
                    " ",
                ) || ["created_at", "desc"];
                filtered.sort((a, b) => {
                    let aVal, bVal;
                    switch (sortKey) {
                        case "name":
                            aVal = a?.name || "";
                            bVal = b?.name || "";
                            break;
                        case "revenue":
                            aVal = a?.revenue || 0;
                            bVal = b?.revenue || 0;
                            break;
                        case "views":
                            aVal = a?.views || 0;
                            bVal = b?.views || 0;
                            break;
                        case "created_at":
                        default:
                            aVal = new Date(a?.createdAt || 0);
                            bVal = new Date(b?.createdAt || 0);
                            break;
                    }

                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                });
            }

            return filtered;
        } catch (error) {
            console.error("Error in getFilteredBundles:", error);
            return [];
        }
    },

    getPaginatedBundles: () => {
        const { getFilteredBundles, pagination } = get();
        const filtered = getFilteredBundles();
        const startIndex =
            (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    },

    getActiveBundlesCount: () => {
        const { bundles } = get();
        return bundles.filter((bundle) => bundle.status === "ACTIVE").length;
    },

    getTotalBundlesCount: () => {
        const { bundles } = get();
        return bundles.length;
    },

    getTotalPages: () => {
        const { getFilteredBundles, pagination } = get();
        const filtered = getFilteredBundles();
        return Math.ceil(filtered.length / pagination.itemsPerPage);
    },

    getPaginationInfo: () => {
        const { getFilteredBundles, pagination, getTotalPages } = get();
        const filtered = getFilteredBundles();
        const totalPages = getTotalPages();
        const startIndex =
            (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;

        return {
            startIndex,
            endIndex,
            hasNext: pagination.currentPage < totalPages,
            hasPrevious: pagination.currentPage > 1,
            label:
                filtered.length > 0
                    ? `Showing Page ${startIndex + 1} of ${totalPages}`
                    : "Showing page 1 of 1",
        };
    },
}));
