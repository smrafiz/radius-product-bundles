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
    typeFilter: string;
    statusFilter: string;
    selectedTab: number;
}

interface Toast {
    active: boolean;
    message: string;
}

interface BundlesState {
    // Data
    bundles: BundleListItem[];
    metrics: BundleMetrics | null;

    // UI State
    loading: boolean;
    error: string | null;
    filters: BundleFilters;
    activePopovers: Record<string, boolean>;
    toast: Toast;

    // Actions
    setBundles: (bundles: BundleListItem[]) => void;
    setMetrics: (metrics: BundleMetrics | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Filter actions
    setSearchValue: (search: string) => void;
    setTypeFilter: (filter: string) => void;
    setStatusFilter: (filter: string) => void;
    setSelectedTab: (tab: number) => void;
    clearFilters: () => void;

    // Popover actions
    togglePopover: (id: string) => void;
    closeAllPopovers: () => void;

    // Toast actions
    showToast: (message: string) => void;
    hideToast: () => void;

    // Computed getters
    getFilteredBundles: () => BundleListItem[];
    getActiveBundlesCount: () => number;
    getTotalBundlesCount: () => number;
}

export const useBundlesStore = create<BundlesState>()((set, get) => ({
    // Initial state
    bundles: [],
    metrics: null,
    loading: true,
    error: null,
    filters: {
        search: "",
        typeFilter: "all",
        statusFilter: "all",
        selectedTab: 0,
    },
    activePopovers: {},
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
    setSearchValue: (search) =>
        set((state) => ({
            filters: { ...state.filters, search },
        })),

    setTypeFilter: (typeFilter) =>
        set((state) => ({
            filters: { ...state.filters, typeFilter },
        })),

    setStatusFilter: (statusFilter) =>
        set((state) => ({
            filters: { ...state.filters, statusFilter },
        })),

    setSelectedTab: (selectedTab) =>
        set((state) => ({
            filters: { ...state.filters, selectedTab },
        })),

    clearFilters: () =>
        set((state) => ({
            filters: {
                ...state.filters,
                search: "",
                typeFilter: "all",
                statusFilter: "all",
                selectedTab: 0,
            },
        })),

    // Popover actions
    togglePopover: (id) =>
        set((state) => ({
            activePopovers: {
                ...state.activePopovers,
                [id]: !state.activePopovers[id],
            },
        })),

    closeAllPopovers: () => set({ activePopovers: {} }),

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

        return bundles.filter((bundle) => {
            // Search filter
            const matchesSearch = bundle.name
                .toLowerCase()
                .includes(filters.search.toLowerCase());

            // Type filter
            const matchesType =
                filters.typeFilter === "all" ||
                bundle.type === filters.typeFilter;

            // Status filter
            const matchesStatus =
                filters.statusFilter === "all" ||
                bundle.status === filters.statusFilter;

            // Tab filter
            let matchesTab = true;
            switch (filters.selectedTab) {
                case 1:
                    matchesTab = bundle.status === "ACTIVE";
                    break;
                case 2:
                    matchesTab = bundle.status === "DRAFT";
                    break;
                case 3:
                    matchesTab = bundle.status === "PAUSED";
                    break;
                case 4:
                    matchesTab = bundle.status === "SCHEDULED";
                    break;
                default:
                    matchesTab = true;
            }

            return matchesSearch && matchesType && matchesStatus && matchesTab;
        });
    },

    getActiveBundlesCount: () => {
        const { bundles } = get();
        return bundles.filter((bundle) => bundle.status === "ACTIVE").length;
    },

    getTotalBundlesCount: () => {
        const { bundles } = get();
        return bundles.length;
    },
}));
